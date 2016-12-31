const express = require('express');
let jenavieve = express.Router();
const baseUrl = '/jenavieve/';
const twilio = require('twilio');
const agent = require('../../services/agentHelpers');

const JENNY_VOICE = agent.getVoice('jenavieve');

const sayings = {

};

jenavieve.post('/', twilio.webhook({ validate: false }), (req, res) => {
    let twiml = new twilio.TwimlResponse();
    twiml.say(`Hello, my name is Jennaveeve! You can call me Jenny if you like.`, JENNY_VOICE);
    res.send(twiml);
});

module.exports = jenavieve;
