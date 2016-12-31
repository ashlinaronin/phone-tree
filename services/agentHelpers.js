const ConsumerProfile = require('../models/ConsumerProfile');
const relatives = ['aunt', 'uncle', 'cousin', 'brother', 'sister', 'daughter', 'son'];
const agents = ['cointreau', 'jenavieve'];

const voices = {
    'cointreau': { voice: 'man', language: 'de' },
    'jenavieve': { voice: 'woman', language: 'fr-FR' }
};

function ask(twiml, agent, question, questionText) {
    const agentUrl = `/${agent}/`;
    twiml.gather({
        action: agentUrl + question,
        method: 'POST',
        timeout: 15,
        finishOnKey: '#'
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
    getVoice,
    randomRelative,
    randomAgent,
    saveResponse
};
