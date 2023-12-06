const { app } = require("./app");
const express = require("express");
const axios = require("axios");
const router = express.Router();
const dot = require('dot-object');
const session = require("express-session");


const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const WHATSAPP_TO = process.env.WHATSAPP_TO;
const WHATSAPP_VERSION = process.env.WHATSAPP_VERSION;
const WHATSAPP_PHONEID = process.env.WHATSAPP_PHONEID;

const bots = {
    "1-js": "http://20.244.48.128:7081/generate_answers?uuid_number=418e9d56-88fa-11ee-9ef3-acde48001122&skip_cache=true&converse=true&query_string=",
    "2-ks": "http://4.224.41.213:8000/query-with-langchain-gpt4?uuid_number=storybot&query_string=",
    "3-ncf": "https://ncfsaarathi.sunbird.org/ncf-chat/answer?model=gpt-3.5&session_id=1701251559361&q="
}
const userSession = {};

const sendMessage = (req, res) => {
    console.log(req.body);
    let messageObj = req.body;
    console.log('-----', req.body)
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
            res.status(response.status).send(response.statusText);
        })
        .catch(function (error) {
            res.status(error.response.status).send(error.response.statusText);
        });
}

/**
 * display_phone_number => Unique for each user based on phone number 
 * Present in metadata & messages.context object 
 */
function getSession(message) {

}

const webhook = async (req, res) => {
    let incomingMsg = req.body.entry || {};
    console.log(incomingMsg);
    let userSelection = await req.session.userSelection || null;
    let msg = incomingMsg && incomingMsg[0] && incomingMsg[0].changes && incomingMsg[0].changes[0].value.messages && incomingMsg[0].changes[0].value.messages[0];
    if (!userSelection && msg.type!=="interactive") {  
        let body = {
            "messaging_product": "whatsapp",
            "to": WHATSAPP_TO,
            "type": "interactive",
            "interactive": {
                "type": "button",
                "header": {
                    "type": "text",
                    "text": "Welcome to DJP"
                },
                "body": {
                    "text": "Please select the options below"
                },
                "action": {
                    "buttons": [
                        {
                            "type": "reply",
                            "reply": {
                                "id": "1-js",
                                "title": "Jaadhu Sakhi"
                            }
                        },
                        {
                            "type": "reply",
                            "reply": {
                                "id": "2-ks",
                                "title": "Katha Sagara"
                            }
                        }
                    ]
                }
            }
        }

        axios.post(
            `https://graph.facebook.com/${WHATSAPP_VERSION}/${WHATSAPP_PHONEID}/messages`,
            body,
            {
                headers: {
                    Authorization: `Bearer ${WHATSAPP_TOKEN}`,
                }
            }).then(
                (response) => {
                    console.log("webhook => Sent initial message to WhatsApp");
                    res.status(response.status).send(response.statusText);
                },
                (error) => {
                    console.log("webhook => error occured  with status code:", error.response.status);
                    res.status(error.response.status).send(error.response.statusText);
                }
            );
    } else {
        console.log('USER Selection----', userSelection)

        if (!userSelection) {
            // If not present, set the default value from the incoming message
            userSelection = msg.interactive.button_reply.id;
            req.session.userSelection = userSelection;
            console.log('Value not present. Setting userSelection:', userSelection);
        } else {
            console.log('Existing userSelection:', userSelection);
        }
        

        let botResponse = await getBotMessage(msg, userSelection);
         console.log("webhook => botResponse", botResponse);
        axios({
            "method": "post",
            "url": `https://graph.facebook.com/${WHATSAPP_VERSION}/${WHATSAPP_PHONEID}/messages`,
            "data": {
                "messaging_product": "whatsapp",
                "to": WHATSAPP_TO,
                "text": { body: botResponse?.answer }
            },
            headers: {
                "Authorization": `Bearer ${WHATSAPP_TOKEN}`,
                "Content-Type": "application/json"
            },
        })
            .then(
                (response) => {
                    console.log("webhook => Sent message to WhatsApp");
                    res.status(response.status).send(response.statusText);
                },
                (error) => {
                    console.log("webhook => error occured  with status code:", error.response.status);
                    res.status(error.response.status).send(error.response.statusText);
                }
            );
    }
}


const getBotMessage = async (msg, userSelection) => {
    if (msg) {
        let userQuery = msg.text && msg.text.body ? msg.text.body : "Hi";
        let botUrl = bots[userSelection]
        switch (userSelection) {
            case "1-js": botUrl = botUrl + userQuery
                break;
            case "2-ks": botUrl = botUrl + userQuery;
                break;
            case "3-ncf": botUrl = botUrl + userQuery + "&sources=NCF_SE;NCF_FS;NEP"
                break;
            default:
                break;
        }

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

module.exports = { sendMessage, webhook }