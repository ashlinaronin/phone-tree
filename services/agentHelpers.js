const ConsumerProfile = require('../models/ConsumerProfile');
const extensions = require('./extensions');
const relatives = ['aunt', 'uncle', 'cousin', 'brother', 'sister', 'daughter', 'son'];
const agents = ['cointreau', 'jenavieve', 'ricardo'];
const baseUrl = require('../config').baseUrl;

const voices = {
    'cointreau': { voice: 'man', language: 'en-GB' },
    'jenavieve': { voice: 'woman', language: 'en-AU' },
    'ricardo': { voice: 'man', language: 'en-US' }
};

function ask(twiml, agent, question, questionText) {
    twiml.gather({
        action: `${baseUrl}/agents/${agent}/` + question,
        method: 'POST',
        timeout: 15,
        finishOnKey: '#'
    }, (node) => node.say(questionText, getVoice(agent)));

    return twiml;
}

function askOneDigit(twiml, agent, question, questionText) {
    twiml.gather({
        action: `${baseUrl}/agents/${agent}/` + question,
        method: 'POST',
        timeout: 10,
        numDigits: 1
    }, (node) => node.say(questionText, getVoice(agent)));

    return twiml;
}

function getVoice(agent) {
    return voices.hasOwnProperty(agent) ? voices[agent] : {};
}

function randomRelative() {
    return randomFromArray(relatives);
}

function randomAgent() {
    return randomFromArray(agents);
}

function randomFromArray(array) {
    return array[ Math.floor(Math.random() * array.length) ];
}

function saveResponse(phone, q, a) {
    let response = {
        'phone': phone,
        'question': q,
        'answer': a
    };

    ConsumerProfile.saveResponse(response);
}

function retrieveResponse(phone, q) {
    return ConsumerProfile.retrieveResponse(phone, q);
}

function transferToProducts(twiml, agent, thankYouMessage) {
    let productsExtension = extensions.getDepartmentExtension('products');
    twiml.say(thankYouMessage, getVoice(agent));
    twiml.play({ digits: productsExtension });
    twiml.redirect(`${baseUrl}/products`);
    return twiml;
}

module.exports = {
    ask,
    askOneDigit,
    getVoice,
    randomRelative,
    randomAgent,
    saveResponse,
    retrieveResponse,
    transferToProducts
};
