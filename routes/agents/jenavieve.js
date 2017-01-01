const express = require('express');
const twilio = require('twilio');
const agent = require('../../services/agentHelpers');
const extensions = require('../../services/extensions');
let jenavieve = express.Router();

const JENAVIEVE = 'jenavieve';
const JENAVIEVE_VOICE = agent.getVoice(JENAVIEVE);

const sayings = {
    ASK_FOR_RELATIONSHIP_STATUS: `Hello, my name is Jenna-veeve! You can call me Jenny if you like.
        I love getting to know our new customers. I have just a few questions for you
        to get an idea of what you're looking for. First of all, what's your current
        relationship status on a scale of 1 to 5? Press 1 for totally single, 5 for, like,
        taken, or any other number in between.`,
    ASK_FOR_DATING_FREQUENCY: `How many dates would you say you go on in the course of an average month?
        It doesn't have to be exact. Enter a reasonable guess and press pound.`,
    ASK_FOR_LIVING_SITUATION: `If you don't mind me asking, do you currently share a living space
        with your partner? Press 1 for yes, any other key for no.`,
    ASK_ABOUT_DATING_OPTIMISM: `On a scale of one to five, do you feel generally optimistic about your
        experience on the dating scene? One being very pessimistic, five being very optimistic.`,
    ASK_ABOUT_LOVE_STYLE: `As I'm sure you know, everyone has a different idea of what love is.
        In his 1973 book Colours of Love, psychologist John Alan Lee identified three primary and
        three secondary love styles, relating them to the familiar concept of primary and secondary colors.
        Which primary style of love do you most readily identify with? Listen to the following three
        options and press the corresponding number.
        1. Air-ohs. Passionate, emotional, sexual, aesthetic, intense love.
        2. Lew-duss. Playful, teasing, indulgent, fun-seeking, casual love.
        3. Store-gay. Familial, friendly, loy-uhl, dutiful love.`,
    THANK_YOU: `Alright, thanks for bearing with me! That's all the questions I have for now. I've
        saved your profile in our system and will transfer you over to Products to complete your order.
        It was great getting to know you a bit! Good luck with everything!`
};

const LOVE_STYLES = {
    1: { name: 'eros', pronunciation: 'air-ohs' },
    2: { name: 'ludus', pronunciation: 'lew-duss' },
    3: { name: 'storge', pronunciation: 'store-gay' }
};

jenavieve.post('/', twilio.webhook({ validate: false }), (req, res) => {
    let twiml = new twilio.TwimlResponse();
    askForRelationshipStatus(twiml);
    res.send(twiml);
});

jenavieve.post('/relationship-status', twilio.webhook({ validate: false }), (req, res) => {
   let twiml = new twilio.TwimlResponse();
   let status = parseInt(req.body.Digits);
   
   agent.saveResponse(req.body.Caller, 'relationship-status', status);

   if (status <= 1) {
       twiml.say(`Oooh, you're single! Way to be.`, JENAVIEVE_VOICE);
       askForDatingFrequency(twiml);
   } else if (status === 2 || status === 3) {
       twiml.say(`I get it, ambiguity is totally in.`, JENAVIEVE_VOICE);
       askForDatingFrequency(twiml);
   } else if (status >= 4) {
       twiml.say(`So you're somewhat hitched. It's great to have a partner in life!
            I've been seeing someone for awhile too.`, JENAVIEVE_VOICE);
       askForLivingSituation(twiml);
   }

   res.send(twiml);
});

jenavieve.post('/dating-frequency', twilio.webhook({ validate: false }), (req, res) => {
   let twiml = new twilio.TwimlResponse();
   let frequency = parseInt(req.body.Digits);
   
   agent.saveResponse(req.body.Caller, 'dating-frequency', frequency);

   if (frequency === 0) {
       twiml.say(`I'm sorry to hear that. I'm sure things will look up for you--
            if you want to be more active, that is. Everybody has their own priorities.`, JENAVIEVE_VOICE);
   } else if (frequency < 5) {
        twiml.say(`Nice! Quality over quantity!`, JENAVIEVE_VOICE);
   } else {
       twiml.say(`${frequency} dates a month! Not bad, not bad.`, JENAVIEVE_VOICE);
   }
   
   askAboutDatingScene(twiml);

   res.send(twiml);
});

jenavieve.post('/lives-with-partner', twilio.webhook({ validate: false }), (req, res) => {
   let twiml = new twilio.TwimlResponse();
   let livesWithPartner = parseInt(req.body.Digits) === 1;

   agent.saveResponse(req.body.Caller, 'lives-with-partner', livesWithPartner);

   if (livesWithPartner) {
       twiml.say(`I think that's really great. Stability is important.`, JENAVIEVE_VOICE);
   } else {
       twiml.say(`That's awesome! Great that you can respect each other's space
            and still be intimate.`, JENAVIEVE_VOICE);
   }

   askAboutLoveStyle(twiml);

   res.send(twiml);
});

jenavieve.post('/dating-optimism', twilio.webhook({ validate: false }), (req, res) => {
   let twiml = new twilio.TwimlResponse();
   let optimism = parseInt(req.body.Digits);

   agent.saveResponse(req.body.Caller, 'dating-optimism', optimism);

   if (optimism < 3) {
       twiml.say(`I'm sorry that you feel that way. It can be tough out there.`, JENAVIEVE_VOICE);
   } else {
       twiml.say(`I'm so happy that you have a good attitude. That really goes a long way.`, JENAVIEVE_VOICE);
   }

   askAboutLoveStyle(twiml);

   res.send(twiml);
});

jenavieve.post('/love-style', twilio.webhook({ validate: false }), (req, res) => {
   let twiml = new twilio.TwimlResponse();
   let loveStyle = getLoveStyle(parseInt(req.body.Digits));

   if (loveStyle) {
       agent.saveResponse(req.body.Caller, 'love-style', loveStyle.name);

       twiml.say(`Ah, you're ${ loveStyle.pronunciation } too! Good to know!`, JENAVIEVE_VOICE);
       transferToProducts(twiml);
   } else {
       // TODO: don't repeat whole shpiel again, just ask the question
       askAboutLoveStyle(twiml);
   }

   res.send(twiml);
});

function askForRelationshipStatus(twiml) {
    return agent.askOneDigit(twiml, JENAVIEVE, 'relationship-status', sayings.ASK_FOR_RELATIONSHIP_STATUS);
}

function askForDatingFrequency(twiml) {
    return agent.ask(twiml, JENAVIEVE, 'dating-frequency', sayings.ASK_FOR_DATING_FREQUENCY);
}

function askForLivingSituation(twiml) {
    return agent.askOneDigit(twiml, JENAVIEVE, 'lives-with-partner', sayings.ASK_FOR_LIVING_SITUATION);
}

function askAboutDatingScene(twiml) {
    return agent.askOneDigit(twiml, JENAVIEVE, 'dating-optimism', sayings.ASK_ABOUT_DATING_OPTIMISM);
}

function askAboutLoveStyle(twiml) {
    return agent.askOneDigit(twiml, JENAVIEVE, 'love-style', sayings.ASK_ABOUT_LOVE_STYLE);
}

function getLoveStyle(digit) {
    return LOVE_STYLES.hasOwnProperty(digit) ? LOVE_STYLES[digit] : null;
}

function transferToProducts(twiml) {
    let productsExtension = extensions.getDepartmentExtension('products');
    twiml.say(sayings.THANK_YOU, JENAVIEVE_VOICE);
    twiml.play({ digits: productsExtension });
    twiml.redirect('/products');

    return twiml;
}

module.exports = jenavieve;