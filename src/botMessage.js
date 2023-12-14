const fs = require('fs');
const defaultLanguageKey = 'en';

const loadLanguageFile=(languageKey) =>{
    const filePath = `${languageKey}.json`;
    
    try {
        const fileData = fs.readFileSync('assets/language/'+filePath, 'utf8');
        const languageObject = JSON.parse(fileData);
        return languageObject;
    } catch (error) {
        console.error(`Error loading language file for '${languageKey}': ${error.message}`);
        return null;
    }
}
let botMessages=loadLanguageFile(defaultLanguageKey)

const setBotMessage=(obj)=>{
    console.log('setting lang to',obj)
    botMessages=obj
}

const getBotMessage = (botId, key) => { 
    return botId ? botMessages[botId][key] : botMessages[key]
}

const getBotWelcomeMessage = (botId) => {
    return getBotMessage(botId, "hi");
}

module.exports = { getBotMessage, getBotWelcomeMessage ,loadLanguageFile,setBotMessage}