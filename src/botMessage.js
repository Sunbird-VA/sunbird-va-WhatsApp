const fs = require('fs');
const botMessages = JSON.parse(fs.readFileSync('assets/botMessages.json', 'utf-8'));


const getBotMessage = (botId, key) => { 
    return botId ? botMessages[botId][key] : botMessages[key]
}

const getBotWelcomeMessage = (botId) => {
    return getBotMessage(botId, "hi");
}

const getFooterMessage= () => {
    return "\n \n Hope you liked it! \n -If you want to go to previous menu enter “*”. \n -If you want to go to main menu enter “#”";
}

module.exports = { getBotMessage, getBotWelcomeMessage,getFooterMessage }