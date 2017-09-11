let products = require('express').Router();
const twilio = require('twilio');
const agent = require('../services/agent-helpers');
const productHelpers = require('../services/product-helpers');
const sms = require('../services/sms');
const baseUrl = require('../config').baseUrl;

const PRODUCTS = 'products';
const PRODUCTS_VOICE = agent.getVoice(PRODUCTS);

const SMS_WAIT_TIME = 35000; // for realism

products.post('/', twilio.webhook({validate: false}), (req, res) => {
    let twiml = new twilio.TwimlResponse();

    productHelpers.getProduct(req.body.Caller)
        .then(product => {
            twiml.say(`Thank you for calling Nectar Products. We hope your experience so far has been to a high standard.
            I see that you spoke with ${product.agent} today! ${product.agent} noted that you were very
            interested in ${product.imageSearchTerm}. Based on their personality assessment, I'm going to
            recommend the ${product.shape} with a ${product.imageSearchTerm} image for you. I hope you like it!
            You should receive a link to your product on your phone in a few minutes. Have a great day and
            please call us again!`, PRODUCTS_VOICE);

            res.send(twiml);

            setTimeout(() => {
                sms.sendProduct(req.body.Caller, product.readableId)
                    .then(() => console.log(`successfully saved product ${product.readableId}`))
                    .catch(err => console.log('error sending sms', err));
            }, SMS_WAIT_TIME);
        })
        .catch(err => {
            console.log('no product...', err);

            let selectedAgent = agent.randomAgent();
            let agentExtension = extensions.getDepartmentExtension(selectedAgent);

            twiml.say(`I'm sorry, it looks like your agent didn't take very good notes. I'm having trouble pulling
                up your information from your system. I'm transferring you to another agent to give it another shot.
                Please excuse the inconvenience and I hope you have a wonderful experience with ${selectedAgent}`, PRODUCTS_VOICE);

            twiml.play({ digits: agentExtension });

            twiml.redirect(`${baseUrl}/agents/${selectedAgent}`);

            res.send(twiml);
        });
});

module.exports = products;
