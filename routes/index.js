const express = require('express');
let router = express.Router();
const twilio = require('twilio');
const agent = require('../services/agentHelpers');
const extensions = require('../services/extensions');

const dingus = require('./dingus');
const agents = require('./agents');
const profiles = require('./profiles');
const products = require('./products');

router.post('/', twilio.webhook({ validate: false }), (req, res) => {
    let twiml = new twilio.TwimlResponse();

    twiml.say(`Thank you for calling today. Please hold while we transfer you
        to the next available representative.`);

    // TODO: warm welcome for repeat callers

    let selectedAgent = agent.randomAgent();
    let agentExtension = extensions.getDepartmentExtension(selectedAgent);

    twiml.play({ digits: agentExtension });

    twiml.redirect(`/agents/${ agent.randomAgent() }`);

    res.send(twiml);
});

router.use('/dingus', dingus);
router.use('/agents', agents);
router.use('/products', products);
router.use('/profiles', profiles); // dump out profiles JSON from DB

module.exports = router;