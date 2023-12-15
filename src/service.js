const { app } = require("./app");
const axios = require("axios");
const botMessage = require("./botMessage");
const util = require("./util");

// Read JSON file
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const WHATSAPP_TO = process.env.WHATSAPP_TO;
const WHATSAPP_VERSION = process.env.WHATSAPP_VERSION;
const WHATSAPP_PHONEID = process.env.WHATSAPP_PHONEID;


const testMessage = (req, res) => {
    console.log(req.body);
    let messageObj = req.body;
    sendMessage(req, res, messageObj);
}

const webhook = async (req, res) => {
    let incomingMsg = req.body.entry || {};
    let userSelection = await req?.session?.userSelection || null;
    let languageSelection = await req?.session?.languageSelection || null;

    let msg = incomingMsg && incomingMsg[0] && incomingMsg[0].changes && incomingMsg[0].changes[0].value.messages && incomingMsg[0].changes[0].value.messages[0];
    if (((!languageSelection && !userSelection && msg?.type !== 'interactive') || msg?.text?.body == '#')) {
        let body = botMessage.getBotMessage('en', null, "lang_selection");
        body.to = WHATSAPP_TO;
        sendMessage(req, res, body)
        req.session.languageSelection = null
        req.session.userSelection = null

    } else if (((!userSelection && !languageSelection && msg?.type === 'interactive') || msg?.text?.body == '*')) {
        req.session.userSelection = null
        // New user or main menu
        util.setUserLaguage(req, msg?.interactive?.button_reply?.id, languageSelection)
        let langKey = msg?.interactive?.button_reply?.id ? msg?.interactive?.button_reply?.id.split('_')[1] : languageSelection.split('_')[1]
        let body = botMessage.getBotMessage(langKey, null, "bot_selection");
        body.to = WHATSAPP_TO;
        sendMessage(req, res, body)
    } else {
        // existing user & converstaion is happening
        console.log('USER Selection----', userSelection)
        userSelection = util.setUserSelection(req, msg?.interactive?.button_reply?.id, userSelection)
        let langKey = languageSelection.split('_')[1]

        if (userSelection) {
            if (msg?.type === 'interactive') {
                console.log("Interactive")
                let message = botMessage.getBotWelcomeMessage(langKey, userSelection)

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
                let loadingBody = botMessage.getBotMessage(langKey, null, "loading_message");
                loadingBody.to = WHATSAPP_TO;
                await sendMessage(res, res, loadingBody);

                //Bot response
                let botResponse = await util.getBotMessage(msg, userSelection);
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
                let footerBody = botMessage.getBotMessage(langKey, null, "footer_message");
                footerBody.to = WHATSAPP_TO;
                await sendMessage(req, res, footerBody);
            }
        } else {
            let body = botMessage.getBotMessage(langKey, null, "bot_selection");
            body.to = WHATSAPP_TO;
            sendMessage(req, res, body)
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

module.exports = { sendMessage, webhook, testMessage }