const fs = require('fs');
const {language_dict} = require("./language");


const getBotMessage = (language='en',botId, key) => { 
    console.log('message',botId ?language_dict[language][botId][key] : language_dict[language][key])
    console.log('bid',botId)
    console.log('key',key)
    return botId ? language_dict[language][botId][key] : language_dict[language][key]
}

const getBotWelcomeMessage = (language='en',botId) => {
    return getBotMessage(language,botId, "hi");
}

module.exports = { getBotMessage, getBotWelcomeMessage }