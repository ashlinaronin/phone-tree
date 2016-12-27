const express = require('express');
var cointreau = express.Router();
const twilio = require('twilio');
const horoscope = require('../../services/horoscope');
const geography = require('../../services/geography');

const relatives = ['aunt', 'uncle', 'cousin', 'brother', 'sister'];

const sayings = {
    ASK_FOR_BIRTHDAY: "Hello! To give you the best consumer experience', I'll need " +
        "some more information about you. Would you mind entering your birthday " +
        "as a four digit number? For example, my birthday is May 8th, so I would " +
        "enter zero-five-zero-eight. Go ahead and enter your birthday and then " +
        "press the pound key.",
    YOUR_SIGN: "Ah! I am sensing that you're a ",
    ASK_FOR_ZIPCODE: "It would also be very helpful to know where you're from. Could you " +
        "please enter your zipcode followed by the pound key? Thanks!",
    IM_LOST: "I have run into an error and I'm really not sure how to proceed. Goodbye?",
    ASK_FOR_AGE: "I'm starting to get a picture of what you are like. " +
        "I Have just one more question for you though. Approximately how old are you? " +
        "I won't tell anyone. Please enter your age, then press pound."
    };

cointreau.post('/', twilio.webhook({ validate: false }), (req, res) => {
    var twiml = new twilio.TwimlResponse();
    askForBirthday(twiml);
    res.send(twiml);
});

cointreau.post('/birthday', twilio.webhook({ validate: false }), (req, res) => {
    var twiml = new twilio.TwimlResponse();

    var birthday = req.body.Digits;
    var sign = horoscope.getSign(birthday);
    twiml.say(sayings.YOUR_SIGN + sign);

    askForZipcode(twiml);
    res.send(twiml);
});

cointreau.post('/ziptest', twilio.webhook({ validate: false }), (req, res) => {
    var twiml = new twilio.TwimlResponse();
    askForZipcode(twiml);
    res.send(twiml);
})

cointreau.post('/zipcode', twilio.webhook({ validate: false }), (req, res) => {
    var twiml = new twilio.TwimlResponse();

    var zipcode = req.body.Digits;

    var phoneLocality = req.body.FromCity.toLowerCase();

    geography.getLocality(zipcode)
        .then((locality) => {
            var relative = getRandomRelative();

            if (locality && relative) {
                twiml.say(`So you're from ${locality}! What a coincidence.
                    My ${relative} is from there! Small world.`);
            } else {
                twiml.say(sayings.IM_LOST)
                twiml.hangup();
            }

            if (locality.toLowerCase() !== phoneLocality) {
                twiml.say(`Here's a fun fact! Your phone seems to be
                    from ${phoneLocality}, but you're from ${locality}...
                    I can dig it though!`)
            }

            askForAge(twiml);

            res.send(twiml);
        })
        .catch((error) => {
            console.log(error);
            twiml.say(sayings.IM_LOST);
            twiml.hangup();
            res.send(twiml);
        });
});

cointreau.post('/age', twilio.webhook({ validate: false }), (req, res) => {
    var twiml = new twilio.TwimlResponse();

    var age = req.body.Digits;
    var relative = getRandomRelative();
    twiml.say(`That's crazy! My ${relative} is your age.`);

    res.send(twiml);
});



function askForBirthday(twiml) {
    twiml.gather({
        action: '/cointreau/birthday',
        numDigits: '4',
        method: 'POST',
        timeout: 15,
        finishOnKey: '#'
    }, (node) => node.say(sayings.ASK_FOR_BIRTHDAY));

    return twiml;
}

function askForZipcode(twiml) {
    twiml.gather({
        action: '/cointreau/zipcode',
        method: 'POST',
        timeout: 15,
        finishOnKey: '#'
    }, (node) => node.say(sayings.ASK_FOR_ZIPCODE));

    return twiml;
}

function askForAge(twiml) {
    twiml.gather({
        action: '/cointreau/age',
        method: 'POST',
        timeout: 15,
        finishOnKey: '#'
    }, (node) => node.say(sayings.ASK_FOR_AGE));

    return twiml;
}

function getRandomRelative() {
    return relatives[ Math.floor(Math.random() * relatives.length) ];
}


module.exports = cointreau;
