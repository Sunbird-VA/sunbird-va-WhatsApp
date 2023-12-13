const { app } = require("./app");
const express = require("express");
const axios = require("axios");
const session = require("express-session");
const fs = require('fs');
const botFile = fs.readFileSync('bots.json', 'utf-8');
const footerFile = fs.readFileSync('footer.json', 'utf-8');
const botMessage = require("./botMessage");

// Read JSON file
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const WHATSAPP_TO = process.env.WHATSAPP_TO;
const WHATSAPP_VERSION = process.env.WHATSAPP_VERSION;
const WHATSAPP_PHONEID = process.env.WHATSAPP_PHONEID;

const bots = JSON.parse(botFile);
const footer = JSON.parse(footerFile);


const testMessage = (req, res) => {
    console.log(req.body);
    let messageObj = req.body;
    axios
        .post(
            `https://graph.facebook.com/${WHATSAPP_VERSION}/${WHATSAPP_PHONEID}/messages`,
            messageObj,
            {
                headers: {
                    Authorization: `Bearer ${WHATSAPP_TOKEN}`,
                },
            }
        )
        .then(function (response) {
            console.log("sendMessage => Sent test message to WhatsApp");
            res.status(response.status).send(response.statusText);
        })
        .catch(function (error) {
            res.status(error.response.status).send(error.response.statusText);
        });
}

const webhook = async (req, res) => {
    let incomingMsg = req.body.entry || {};
    console.log(incomingMsg);
    let userSelection = await req?.session?.userSelection || null;
    let languageSelection = await req?.session?.languageSelection || null;

    let msg = incomingMsg && incomingMsg[0] && incomingMsg[0].changes && incomingMsg[0].changes[0].value.messages && incomingMsg[0].changes[0].value.messages[0];
    if (((!userSelection && msg?.type !== 'interactive') || msg?.text?.body == '*')) {
        // New user or main menu
        let body = botMessage.getBotMessage(null, "bot-selection");
        body.to = WHATSAPP_TO;
        sendMessage(req, res, body)
    } else {
        // existing user & converstaion is happening
        console.log('USER Selection----', userSelection)

        if (!userSelection) {
            // If not present, set the default value from the incoming message
            userSelection = msg.interactive.button_reply.id;
            req.session.userSelection = userSelection;
            console.log('Value not present. Setting userSelection:', userSelection);
        } else {
            console.log('Existing userSelection:', userSelection);
        }

        if (msg?.type === 'interactive') {
            console.log("Interactive")
            let message = botMessage.getBotWelcomeMessage(userSelection)

            let body = {
                "messaging_product": "whatsapp",
                "to": WHATSAPP_TO,
                "text": {
                    "body": message,
                }
            }
            sendMessage(req, res, body);
        } else {
            console.log("Non-Interactive")

            //Loading
            let bodyForLoad = {
                "messaging_product": "whatsapp",
                "to": WHATSAPP_TO,
                "text": {
                    "body": "Crafting the response! Please hold on!!",
                }
            }
            await sendMessage(res, res, bodyForLoad);

            //Bot response
            let botResponse = await getBotMessage(msg, userSelection);
            let ansStr = botResponse?.answer.substring(0, 800);

            let body = {
                "messaging_product": "whatsapp",
                "to": WHATSAPP_TO,
                "text": {
                    "body": ansStr,
                }
            }
            await sendMessage(req, res, body);

            //Footer message
            let endMsg = botMessage.getFooterMessage();
            let footerBody = {
                "messaging_product": "whatsapp",
                "to": WHATSAPP_TO,
                "text": {
                    "body": endMsg,
                }
            }
            await sendMessage(req, res, footerBody);
        }
    }
}

const sendMessage = async (req, res, body) => {
    try {
        const response = await axios.post(
            `https://graph.facebook.com/${WHATSAPP_VERSION}/${WHATSAPP_PHONEID}/messages`,
            body,
            {
                headers: {
                    Authorization: `Bearer ${WHATSAPP_TOKEN}`,
                }
            }
        );
        console.log("webhook => Sent message to WhatsApp");
        res.status(response.status).send(response.statusText);
    } catch (error) {
        //  console.log("webhook => error occurred with status code:", error?.response?.status);
        res.status(error?.response?.status).send(error?.response?.statusText);
    }
}


const getBotMessage = async (msg, userSelection) => {
    if (msg) {
        let userQuery = msg.text && msg.text.body ? msg.text.body : "Hi";
        let botUrl = bots[userSelection] + userQuery

        console.log('botURL', botUrl)
        try {
            const { data, status } = await axios({
                "method": "get",
                "url": botUrl
            })
            console.log("getBotMessage => Bot", botUrl, " respond sucessfully");
            return data;
        } catch (error) {
            if (error.response) {
                // The request was made, but the server responded with a status code other than 2xx
                console.error('Server Error:', error.response.status, error.response.data);
            } else if (error.request) {
                // The request was made but no response was received
                console.error('No response from server:', error.request);
            } else {
                // Something happened in setting up the request that triggered an Error
                console.error('Error during request setup:', error.message);
            }
        }
    }
}

module.exports = { sendMessage, webhook, testMessage }