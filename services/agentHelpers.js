const ConsumerProfile = require('../models/ConsumerProfile');
const relatives = ['aunt', 'uncle', 'cousin', 'brother', 'sister', 'daughter', 'son'];

function ask(twiml, agentUrl, question, questionText) {
    twiml.gather({
        action: agentUrl + question,
        method: 'POST',
        timeout: 15,
        finishOnKey: '#'
    }, (node) => node.say(questionText));

    return twiml;
}

function randomRelative() {
    return relatives[ Math.floor(Math.random() * relatives.length) ];
}

function saveResponse(phone, q, a) {
    console.log(`saving response:
        Q. ${q}
        A. ${a}`);

    let response = {
        'phone': phone,
        'question': q,
        'answer': a
    };

    ConsumerProfile.saveResponse(response);
}

module.exports = {
    ask,
    randomRelative,
    saveResponse
};
