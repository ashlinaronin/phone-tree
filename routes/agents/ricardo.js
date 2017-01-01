const express = require('express');
const twilio = require('twilio');
const agent = require('../../services/agentHelpers');
const extensions = require('../../services/extensions');
let ricardo = express.Router();

const RICARDO = 'ricardo';
const RICARDO_VOICE = agent.getVoice(RICARDO);

const sayings = {
    HELLO: `Hey, Ricky here. I'm gonna grab some stats from you real quick and then we'll shoot you
        off to Products. Lezz go!`
};

ricardo.post('/', twilio.webhook({ validate: false }), (req, res) => {
    let twiml = new twilio.TwimlResponse();
    twiml.say(sayings.HELLO, RICARDO_VOICE);
    res.send(twiml);
});

module.exports = ricardo;
