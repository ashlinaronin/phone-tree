let products = require('express').Router();
const twilio = require('twilio');

products.post('/', twilio.webhook({validate: false}), (req, res) => {
    let twiml = new twilio.TwimlResponse();

    twiml.say(`Thank you for calling Products. This department is currently undergoing
        routine maintenance. Please call back later.`);

    res.send(twiml);
});

module.exports = products;