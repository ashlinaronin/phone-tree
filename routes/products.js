let products = require('express').Router();
const twilio = require('twilio');
const ConsumerProfile = require('../models/ConsumerProfile');
const agent = require('../services/agent-helpers');
const sms = require('../services/sms');

const sayings = {
    ASK_ABOUT_COLOR: `Thank you for calling Products. You have been selected for a beta test
        while our platform is under development. In order to generate an ideal product
        for you, we will need to know your favorite color. Please listen to the following
        list of color options, then press the number of your favorite color and press pound.`
};

const colors = {
    0: 'red',
    1: 'white',
    2: 'blue',
    3: 'black',
    4: 'orange',
    5: 'green',
    6: 'yellow',
    7: 'pink',
    8: 'brown',
    9: 'mauve'
};

products.post('/', twilio.webhook({validate: false}), (req, res) => {
    let twiml = new twilio.TwimlResponse();

    twiml.gather({
        action: '/products/favorite-color',
        method: 'POST',
        timeout: 10,
        numDigits: 1
    }, (node) => node.say(sayings.ASK_ABOUT_COLOR));

    res.send(twiml);
});

products.post('/favorite-color', twilio.webhook({ validate: false }), (req, res, next) => {
    let twiml = new twilio.TwimlResponse();
    let favoriteColor = colors[req.body.Digits];

    agent.saveResponse(req.body.Caller, 'favorite-color', favoriteColor);

    ConsumerProfile.saveProduct({
        timestamp: new Date(),
        phone: req.body.Caller,
        color: favoriteColor,
        shape: 'cactus'
    });

    twiml.say(`${favoriteColor}? Perfect, thank you so much. You should receive your order soon.
        Have a nice day!`);

    sms.sendProduct(req.body.Caller, 'http://lorempixel.com/400/200/food/');

    res.send(twiml);
});


products.get('/test-sms', function(req, res, next) {
    sms.sendProduct('+15093414961', 'http://587f4810.ngrok.io/')
        .then(msg => res.send(msg))
        .catch(err => res.status(500).send(err));
});

products.get('/save-product-test', function(req, res, next) {

    ConsumerProfile.saveProduct({
        phone: '+5093414961',
        timestamp: new Date(),
        color: 0x00ff00,
        shape: 'cactus'
    });

});


module.exports = products;