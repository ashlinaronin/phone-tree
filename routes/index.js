const express = require('express');
let router = express.Router();
const twilio = require('twilio');
const agent = require('../services/agent-helpers');
const extensions = require('../services/extensions');
const baseUrl = require('../config').baseUrl;

const dingus = require('./dingus');
const agents = require('./agents');
const profiles = require('./profiles');
const productDetails = require('./product-details');
const products = require('./products');
const test = require('./test');

const SALES_VOICE = agent.getVoice('sales');

router.post('/', twilio.webhook({ validate: false }), (req, res) => {
    let twiml = new twilio.TwimlResponse();

    twiml.say(`Thank you for calling Nectar. Please hold while we transfer you
        to the next available representative.`, SALES_VOICE);

    let selectedAgent = agent.randomAgent();
    let agentExtension = extensions.getDepartmentExtension(selectedAgent);

    twiml.play({ digits: agentExtension });

    twiml.redirect(`${baseUrl}/agents/${selectedAgent}`);

    res.send(twiml);
});

router.post('/error', twilio.webhook({ validate: false}), (req, res) => {
    let twiml = new twilio.TwimlResponse();

    twiml.say(`We're sorry, we're currently experiencing technical difficulties. Please hold
        while I transfer you to the next available representative`, SALES_VOICE);

    let selectedAgent = agent.randomAgent();
    let agentExtension = extensions.getDepartmentExtension(selectedAgent);

    twiml.play({ digits: agentExtension });

    twiml.redirect(`${baseUrl}/agents/${selectedAgent}`);

    res.send(twiml);
});

router.use('/dingus', dingus);
router.use('/agents', agents);
router.use('/products', products);
router.use('/product-details', productDetails);
router.use('/profiles', profiles); // dump out profiles JSON from DB
router.use('/test', test);

module.exports = router;