const express = require('express');
const twilio = require('twilio');
const agent = require('../../services/agent-helpers');
const extensions = require('../../services/extensions');
let ada = express.Router();

const ADA = 'ada';
const ADA_VOICE = agent.getVoice(ADA);

const sayings = {

};

ada.post('/', twilio.webhook({ validate: false }), (req, res) => {
    let twiml = new twilio.TwimlResponse();
    let phoneCity = req.body.FromCity.toLowerCase();

    twiml.say(`Greetings. I will be your agent of truth tonight. Tell me,
        does the dark wind rise from the East in ${phoneCity}? Press
        6 for yes, any other key for no.`, ADA_VOICE);

    agent.ask(twiml, ADA, 'dark-wind', sayings.ASK_ABOUT_DARK_WIND);
    res.send(twiml);
});

module.exports = ada;
