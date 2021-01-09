const express = require('express');
const twilio = require('twilio');
const horoscope = require('../../services/horoscope');
const geography = require('../../services/geography');
const agent = require('../../services/agent-helpers');
const productHelpers = require('../../services/product-helpers');
const extensions = require('../../services/extensions');
let cointreau = express.Router();

const COINTREAU = 'cointreau';
const COINTREAU_VOICE = agent.getVoice(COINTREAU);

const sayings = {
    ASK_FOR_BIRTHDAY: `Hello! Thank you for calling Nectar. My name is Cointreau and
        I'll be your agent today. To give you the best consumer experience', I'll need
        some information about you. First of all, would you mind entering your birthday
        as a four digit number? For example, my birthday is May 8th, so I would enter
        zero-five-zero-eight. Go ahead and enter your birthday and then press the pound key.`,
    ASK_FOR_ZIPCODE: `It would also be very helpful to know where you're from. Could you
        please enter your zipcode followed by the pound key? Thanks!`,
    IM_LOST: `I have run into an error and I'm really not sure how to proceed. Goodbye?`,
    ASK_FOR_AGE: `I'm starting to get a picture of what you are like.
        I have just a few more questions for you. Approximately how old are you?
        I won't tell anyone. Please enter your age, then press pound.`,
    ASK_FOR_MONTHLY_SPENDING: `How much do you spend on personal goods in the course of
        an average month? This will help me recommend an ideal product for you. Please enter
        the amount in dollars and press pound.`,
    THANK_YOU: `I've saved your profile in our system and will transfer you over to Products
        to complete your order. It was great talking with you today!`
    };

cointreau.post('/', twilio.webhook({ validate: false }), (req, res) => {
    let twiml = new twilio.TwimlResponse();

    askForBirthday(twiml);

    // temporarily disabled due to bot abuse driving up account charges
    // agent.redo(twiml, COINTREAU, '');
    twiml.say("I'm sorry, I didn't get a response. Feel free to give us a call again.", COINTREAU_VOICE);

    return res.send(twiml);
});

cointreau.post('/birthday', twilio.webhook({ validate: false }), (req, res) => {
    let twiml = new twilio.TwimlResponse();

    if (!req.body.Digits) {
        reAskZipcode(twiml);
        return res.send(twiml);
    }

    let birthday = req.body.Digits;
    let sign = horoscope.getSign(birthday);

    if (!sign) {
        reAskBirthday(twiml);
        return res.send(twiml);
    }

    agent.saveResponse(req.body.Caller, 'sign', sign, COINTREAU);
    twiml.say(`Ah! I am sensing that you're a ${sign}.`, COINTREAU_VOICE);
    twiml.pause();

    askForZipcode(twiml);

    agent.redo(twiml, COINTREAU, 'birthday');

    return res.send(twiml);
});

cointreau.post('/zipcode', twilio.webhook({ validate: false }), (req, res) => {
    let twiml = new twilio.TwimlResponse();

    if (!req.body.Digits) {
        askForAge(twiml);
        agent.redo(twiml, COINTREAU, 'zipcode');
        return res.send(twiml);
    }


    let zipcode = req.body.Digits;
    let phoneLocality = req.body.FromCity.toLowerCase();

    geography.getLocality(zipcode)
        .then((locality) => {
            if (!locality) {
                reAskZipcode(twiml);
                return res.send(twiml);
            }

            agent.saveResponse(req.body.Caller, 'locality', locality, COINTREAU);

            let relative = agent.randomRelative();

            if (locality && relative) {
                twiml.say(`So you're from ${locality}! What a coincidence.
                My ${relative} is from there! Small world.`, COINTREAU_VOICE);
            }

            if (locality.toLowerCase() !== phoneLocality) {
                twiml.pause();
                twiml.say(`Here's a fun fact! Your phone seems to be
                from ${phoneLocality}, but you're from ${locality}...
                I can dig it though!`, COINTREAU_VOICE);
            }

            twiml.pause();

            askForAge(twiml);

            agent.redo(twiml, COINTREAU, 'zipcode');

            return res.send(twiml);
        })
        .catch((error) => {
            console.log(error);
            reAskZipcode(twiml);
            return res.send(twiml);
        });
});

cointreau.post('/age', twilio.webhook({ validate: false }), (req, res) => {
    let twiml = new twilio.TwimlResponse();

    if (!req.body.Digits) {
        askForMonthlySpending(twiml);
        agent.redo(twiml, COINTREAU, 'age');
        return res.send(twiml);
    }


    let age = parseInt(req.body.Digits);
    agent.saveResponse(req.body.Caller, 'age', age, COINTREAU);

    if (age % 3 === 0) {
        twiml.say(`A multiple of three! You must be a very lucky person.`, COINTREAU_VOICE);
    } else {
        let relative = agent.randomRelative();
        twiml.say(`That's crazy! My ${relative} is your age.`, COINTREAU_VOICE);
    }

    twiml.pause();

    askForMonthlySpending(twiml);

    agent.redo(twiml, COINTREAU, 'age');

    return res.send(twiml);
});

cointreau.post('/monthly-spending', twilio.webhook({ validate: false }), (req,res) => {
   let twiml = new twilio.TwimlResponse();

   if (!req.body.Digits) {
       agent.redo(twiml, COINTREAU, 'age');
       return res.send(twiml);
   }

   let monthlySpending = parseInt(req.body.Digits);

   console.log('cointreau before save response spending');

   agent.saveResponse(req.body.Caller, 'monthly-spending', monthlySpending, COINTREAU);

   console.log('countrea after save repsonse');

   if (monthlySpending < 2000) {
       twiml.say(`That's about the range I'd expect for someone your age.`, COINTREAU_VOICE);
   } else {
       twiml.say(`You treat yourself well. I respect that.`, COINTREAU_VOICE);
   }

   console.log('i made it past the spending check');

   return designProduct(req.body.Caller)
       .then(() => {
           console.log('before transfer to products');
           agent.transferToProducts(twiml, COINTREAU, sayings.THANK_YOU);
           console.log('after transfer to products');
           return res.send(twiml);
       })
       .catch(err => {
           console.log('err designing cointreau product', err);
           agent.onError(twiml, COINTREAU);
           return res.send(twiml);
       });
});


function designProduct(phone) {
    return agent.retrieveResponse(phone, 'sign')
        .then(sign => {
            const newProduct = {
                phone: phone,
                shape: chooseShape(),
                imageSearchTerm: sign,
                agent: COINTREAU
            };

            console.log('cointreau new product', newProduct);

            return productHelpers.saveProduct(newProduct);
        })
        .catch(err => {
            console.log('err inner designing cointreau product', err);
            agent.onError(twiml, COINTREAU);
            return res.send(twiml);
        });
}

function chooseShape() {
    return Math.random() < 0.5 ? 'snuggy' : 'mug';
}

function askForBirthday(twiml) {
    return agent.ask(twiml, COINTREAU, 'birthday', sayings.ASK_FOR_BIRTHDAY)
}

function reAskBirthday(twiml) {
    twiml.say(`I'm sorry, I don't understand that birthday.`, COINTREAU_VOICE);
    agent.redo(twiml, COINTREAU, '');
}

function askForZipcode(twiml) {
    return agent.ask(twiml, COINTREAU, 'zipcode', sayings.ASK_FOR_ZIPCODE)
}

function reAskZipcode(twiml) {
    twiml.say(`I don't recognize that zipcode.`, COINTREAU_VOICE);
    agent.ask(twiml, COINTREAU, 'zipcode', `Please try entering your zipcode
                again, then press pound.`);
    agent.redo(twiml, COINTREAU, 'birthday');
}

function askForAge(twiml) {
    return agent.ask(twiml, COINTREAU, 'age', sayings.ASK_FOR_AGE);
}

function askForMonthlySpending(twiml) {
    return agent.ask(twiml, COINTREAU, 'monthly-spending', sayings.ASK_FOR_MONTHLY_SPENDING);
}

module.exports = cointreau;