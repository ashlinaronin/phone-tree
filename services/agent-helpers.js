const ConsumerProfile = require('../models/ConsumerProfile');
const extensions = require('./extensions');
const relatives = ['aunt', 'uncle', 'cousin', 'brother', 'sister', 'daughter', 'son'];
const agents = ['cointreau', 'jenavieve', 'ricardo']; // only functional agents
const baseUrl = require('../config').baseUrl;

const voices = {
    'sales': { voice: 'alice', language: 'en-CA' },
    'products': { voice: 'woman', language: 'en-GB' },
    'cointreau': { voice: 'man', language: 'en-GB' },
    'jenavieve': { voice: 'woman', language: 'en-AU' },
    'ricardo': { voice: 'man', language: 'en' }
};

function ask(twiml, agent, question, questionText) {
    twiml.gather({
        action: `${baseUrl}/agents/${agent}/${question}`,
        method: 'POST',
        timeout: 7,
        finishOnKey: '#'
    }, (node) => node.say(questionText, getVoice(agent)));

    return twiml;
}

function redo(twiml, agent, question) {
    twiml.redirect(`${baseUrl}/agents/${agent}/${question}`);
}

function onError(twiml, agent) {
    twiml.say(`We're sorry, it looks like ${agent} is having some technical difficulties.
        Please stay on the line! I am transferring you to another representative who will
        take care of you.`, voices.sales);

    let selectedAgent = agent.randomAgent();
    let agentExtension = extensions.getDepartmentExtension(selectedAgent);
    twiml.play({ digits: agentExtension });
    twiml.redirect(`${baseUrl}/agents/${randomAgent()}`);
}

function askOneDigit(twiml, agent, question, questionText) {
    twiml.gather({
        action: `${baseUrl}/agents/${agent}/` + question,
        method: 'POST',
        timeout: 5,
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

function saveResponse(phone, question, answer, agent) {
    let response = {
        phone,
        question,
        answer,
        agent
    };

    return ConsumerProfile.saveResponse(response);
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
    redo,
    onError,
    getVoice,
    randomRelative,
    randomAgent,
    saveResponse,
    retrieveResponse,
    transferToProducts
};
