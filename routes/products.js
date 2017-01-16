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
    0: { name: 'red', hex: '#ff0000' },
    1: { name: 'white', hex: '#ffffff' },
    2: { name: 'blue', hex: '#0000ff' },
    3: { name: 'black', hex: '#000000' },
    4: { name: 'orange', hex: '#ffa500' },
    5: { name: 'green', hex: '#00ff00' },
    6: { name: 'yellow', hex: '#ffff00' },
    7: { name: 'pink', hex: '#ff0080' },
    8: { name: 'brown', hex: '#654321' },
    9: { name: 'mauve', hex: '#b784a7' }
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

    ConsumerProfile.saveProduct({
        timestamp: new Date(),
        phone: req.body.Caller,
        color: favoriteColor.hex,
        shape: 'cactus'
    });

    twiml.say(`${favoriteColor.name}? Perfect, thank you so much. You should receive your order soon.
        Have a nice day!`);

    sms.sendProduct(req.body.Caller, 'http://lorempixel.com/400/200/food/');

    res.send(twiml);
});

module.exports = products;