
const fs = require('fs');
const bots = JSON.parse(fs.readFileSync('assets/bots.json', 'utf-8'));
const axios = require("axios");

const setUserLaguage = (req, id, languageSelection) => {
    if (!languageSelection && id.includes('lan')) {
        // If not present, set the default value from the incoming message
        languageSelection = id;
        req.session.languageSelection = languageSelection;
        console.log('Value not present. Setting languageSelection:', languageSelection);
    } else {
        console.log('Existing languageSelection:', languageSelection);
        if (id && languageSelection !== id && msg.interactive.button_reply.id.includes('lan')) {
            req.session.languageSelection = id;
            console.log('Updated languageSelection:', id);
        }
    }
}

const setUserSelection = (req, id, userSelection) => {
    if (!userSelection) {
        // If not present, set the default value from the incoming message
        userSelection = id;
        req.session.userSelection = userSelection;
        console.log('Value not present. Setting userSelection:', userSelection);
        return userSelection;
    } else {
        console.log('Existing userSelection:', userSelection);
        if (id && userSelection !== id) {
            req.session.userSelection = id;
            console.log('Updated userSelection:', id);
        }
        return userSelection;
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



module.exports = { setUserLaguage, setUserSelection, getBotMessage }