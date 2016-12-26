const express = require('express');
var cointreau = express.Router();
const twilio = require('twilio');
const horoscope = require('../../services/horoscope');

const sayings = {
    HELLO_BIRTHDAY: "Hello! To give you the best consumer experience', I'll need " +
        "some more information about you. Would you mind entering your birthday " +
        "as a four digit number? For example, my birthday is May 8th, so I would " +
        "enter zero-five-zero-eight. Go ahead and enter your birthday and then " +
        "press the pound key.",
    YOUR_SIGN: "Ah! I am sensing that you're a "
};

cointreau.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

cointreau.post('/', twilio.webhook({ validate: false }), (req, res) => {
    var twiml = new twilio.TwimlResponse();
    twiml.gather({
        action: '/cointreau/birthday',
        numDigits: '4',
        method: 'POST',
        timeout: 15,
        finishOnKey: '#'
    }, function (node) {
        node.say(sayings.HELLO_BIRTHDAY);
    });
    res.send(twiml);
});

cointreau.post('/birthday', twilio.webhook({ validate: false }), (req, res) => {
    var birthday = req.body.Digits;

    var sign = horoscope.getSign(birthday);

    var twiml = new twilio.TwimlResponse();
    twiml.say(sayings.YOUR_SIGN + sign);
    twiml.hangup();
    res.send(twiml);
});

module.exports = cointreau;
