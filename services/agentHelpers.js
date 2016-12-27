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
}

module.exports = {
    ask: ask,
    randomRelative: randomRelative,
    saveResponse: saveResponse
};
