const express = require('express');
const twilio = require('twilio');
const agent = require('../../services/agent-helpers');
const extensions = require('../../services/extensions');
let faraday = express.Router();

const FARADAY = 'faraday';
const FARADAY_VOICE = agent.getVoice(FARADAY);

const sayings = {

};

faraday.post('/', twilio.webhook({ validate: false }), (req, res) => {
    let twiml = new twilio.TwimlResponse();
    let phoneCity = req.body.FromCity.toLowerCase();

    twiml.say(`Greetings. I will be your agent of truth tonight. Tell me,
        does the dark wind rise from the East in ${phoneCity}? Press
        6 for yes, any other key for no.`, FARADAY_VOICE);

    agent.ask(twiml, FARADAY, 'dark-wind', sayings.ASK_ABOUT_DARK_WIND);
    res.send(twiml);
});

faraday.post('/')

module.exports = faraday;
