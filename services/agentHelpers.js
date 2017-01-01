const ConsumerProfile = require('../models/ConsumerProfile');
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

module.exports = {
    ask,
    askOneDigit,
    getVoice,
    randomRelative,
    randomAgent,
    saveResponse
};
