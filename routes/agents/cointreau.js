const express = require('express');
const twilio = require('twilio');
const horoscope = require('../../services/horoscope');
const geography = require('../../services/geography');
const agent = require('../../services/agent-helpers');
const extensions = require('../../services/extensions');
const baseUrl = require('../../config').baseUrl;
let cointreau = express.Router();

const COINTREAU = 'cointreau';
const COINTREAU_VOICE = agent.getVoice(COINTREAU);

const sayings = {
    ASK_FOR_BIRTHDAY: "Hello! To give you the best consumer experience', I'll need " +
        "some more information about you. Would you mind entering your birthday " +
        "as a four digit number? For example, my birthday is May 8th, so I would " +
        "enter zero-five-zero-eight. Go ahead and enter your birthday and then " +
        "press the pound key.",
    ASK_FOR_ZIPCODE: "It would also be very helpful to know where you're from. Could you " +
        "please enter your zipcode followed by the pound key? Thanks!",
    IM_LOST: "I have run into an error and I'm really not sure how to proceed. Goodbye?",
    ASK_FOR_AGE: "I'm starting to get a picture of what you are like. " +
        "I Have just one more question for you though. Approximately how old are you? " +
        "I won't tell anyone. Please enter your age, then press pound.",
    ASK_FOR_MONTHLY_SPENDING: "How much do you spend on personal goods in the course of " +
        "an average month? This will help me recommend an ideal product for you. Please enter " +
        "the amount in dollars and press pound.",
    THANK_YOU: `I've saved your profile in our system and will transfer you over to Products
        to complete your order. It was great talking with you today!`
    };

cointreau.post('/', twilio.webhook({ validate: false }), (req, res) => {
    let twiml = new twilio.TwimlResponse();
    askForBirthday(twiml);
    res.send(twiml);
});

cointreau.post('/birthday', twilio.webhook({ validate: false }), (req, res) => {
    let twiml = new twilio.TwimlResponse();

    let birthday = req.body.Digits;
    let sign = horoscope.getSign(birthday);
    agent.saveResponse(req.body.Caller, 'sign', sign);

    twiml.say(`Ah! I am sensing that you're a ${sign}.`, COINTREAU_VOICE);

    askForZipcode(twiml);
    res.send(twiml);
});

cointreau.post('/ziptest', twilio.webhook({ validate: false }), (req, res) => {
    let twiml = new twilio.TwimlResponse();
    askForZipcode(twiml);
    res.send(twiml);
});

cointreau.post('/zipcode', twilio.webhook({ validate: false }), (req, res) => {
    let twiml = new twilio.TwimlResponse();
    let zipcode = req.body.Digits;
    let phoneLocality = req.body.FromCity.toLowerCase();

    geography.getLocality(zipcode)
        .then((locality) => {
            agent.saveResponse(req.body.Caller, 'locality', locality);

            let relative = agent.randomRelative();

            if (locality && relative) {
                twiml.say(`So you're from ${locality}! What a coincidence.
                    My ${relative} is from there! Small world.`, COINTREAU_VOICE);
            } else {
                twiml.say(sayings.IM_LOST);
                twiml.hangup();
            }

            if (locality.toLowerCase() !== phoneLocality) {
                twiml.say(`Here's a fun fact! Your phone seems to be
                    from ${phoneLocality}, but you're from ${locality}...
                    I can dig it though!`, COINTREAU_VOICE)
            }

            askForAge(twiml);

            res.send(twiml);
        })
        .catch((error) => {
            console.log(error);
            twiml.say(sayings.IM_LOST, COINTREAU_VOICE);
            twiml.hangup();
            res.send(twiml);
        });
});

cointreau.post('/age', twilio.webhook({ validate: false }), (req, res) => {
    let twiml = new twilio.TwimlResponse();
    let age = req.body.Digits;

    agent.saveResponse(req.body.Caller, 'age', age);

    if (age % 3 === 0) {
        twiml.say(`A multiple of three! You must be a very lucky person.`, COINTREAU_VOICE);
    } else {
        let relative = agent.randomRelative();
        twiml.say(`That's crazy! My ${relative} is your age.`, COINTREAU_VOICE);
    }

    askForMonthlySpending(twiml);

    res.send(twiml);
});

cointreau.post('/monthly-spending', twilio.webhook({ validate: false }), (req,res) => {
   let twiml = new twilio.TwimlResponse();
   let monthlySpending = req.body.Digits;
   agent.saveResponse(req.body.Caller, 'monthly-spending', monthlySpending);

   if (monthlySpending < 2000) {
       twiml.say(`That's about the range I'd expect for someone your age.`, COINTREAU_VOICE);
   } else {
       twiml.say(`You treat yourself well. I respect that.`, COINTREAU_VOICE)
   }

   agent.transferToProducts(twiml, COINTREAU, sayings.THANK_YOU);
   res.send(twiml);
});

function askForBirthday(twiml) {
    return agent.ask(twiml, COINTREAU, 'birthday', sayings.ASK_FOR_BIRTHDAY)
}

function askForZipcode(twiml) {
    return agent.ask(twiml, COINTREAU, 'zipcode', sayings.ASK_FOR_ZIPCODE)
}

function askForAge(twiml) {
    return agent.ask(twiml, COINTREAU, 'age', sayings.ASK_FOR_AGE);
}

function askForMonthlySpending(twiml) {
    return agent.ask(twiml, COINTREAU, 'monthly-spending', sayings.ASK_FOR_MONTHLY_SPENDING);
}

module.exports = cointreau;
