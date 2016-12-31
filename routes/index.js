const express = require('express');
let dispatch = express.Router();
const twilio = require('twilio');
const agent = require('../services/agentHelpers');
const extensions = require('../services/extensions');

dispatch.post('/', twilio.webhook({ validate: false }), (req, res) => {
    let twiml = new twilio.TwimlResponse();

    twiml.say(`Thank you for calling today. Please hold while we transfer you
        to the next available representative.`);

    let selectedAgent = agent.randomAgent();
    let agentExtension = extensions.getDepartmentExtension(selectedAgent);

    twiml.play({ digits: agentExtension });
    twiml.redirect(agent.randomAgent());

    res.send(twiml);
});

module.exports = dispatch;