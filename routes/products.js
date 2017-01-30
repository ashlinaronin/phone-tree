let products = require('express').Router();
const twilio = require('twilio');
const ConsumerProfile = require('../models/ConsumerProfile');
const agent = require('../services/agent-helpers');
const productHelpers = require('../services/product-helpers');
const sms = require('../services/sms');

products.post('/', twilio.webhook({validate: false}), (req, res) => {
    let twiml = new twilio.TwimlResponse();

    productHelpers.getProduct(req.body.Caller)
        .then(product => {
            twiml.say(`Thank you for calling Products. We hope your experience so far has been to a high standard.
            I see that you spoke with ${product.agent} today! ${product.agent} noted that you were very
            interested in ${product.imageSearchTerm}. Based on their personality assessment, I'm going to
            recommend the ${product.shape} for you. I hope you like it! You should receive a link to your product
            on your phone in a few minutes. Have a great day and please call us again!`);

            sms.sendProduct(req.body.Caller, product.readableId)
                .then(() => res.send(twiml))
                .catch(err => console.log('error sending sms', err));
        })
        .catch(err => {
            console.log('no product...', err);
            twiml.say('sorry');
            res.send(twiml);
        });
});

module.exports = products;