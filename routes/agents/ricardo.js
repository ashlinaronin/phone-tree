const express = require('express');
const twilio = require('twilio');
const agent = require('../../services/agentHelpers');
const extensions = require('../../services/extensions');
let ricardo = express.Router();

const RICARDO = 'ricardo';
const RICARDO_VOICE = agent.getVoice(RICARDO);

const sayings = {
    HELLO: `Hey, Ricky here. I'm gonna grab some stats from you real quick and then we'll shoot you
        off to Products. Lezz go!`,
    ASK_ABOUT_WORKOUT_FREQUENCY: `This might sound wack, but bear with me. How many times do you
        work out in a typical week? Enter the number on your phone's keypad.`,
    ASK_ABOUT_MEALS_PER_DAY: `Some people (like me) constantly need calories, so we "graze" on mad
        snacks, shakes or bars. Others hit all their macros in a few hefty portions. How many
        meals do you eat in a day? Enter the number on the keypad.`,
    ASK_ABOUT_BODY_FAT_PERCENTAGE: `I don't know if you go to the gym a lot, but if you've ever
        had a consult with a trainer, they probably told you your body fat percentage, dude.
        If you know yours, enter it into the keypad and press pound. If you don't know it, press
        Star.`,
    ASK_ABOUT_DIETARY_RESTRICTIONS: `These days almost everybody has some kind of dietary restriction.
        Listen to the following list of dietary restrictions. Press the number of any that pertain to you.
        Press pound when you're done. Are you:`,
    LIST_OF_DIETARY_RESTRICTIONS: `1. Vegetarian
            2. Vegan
            3. Gluten-free or celiac
            4. Paleo
            5. Low-carb, Atkins, or South Beach
            6. Lactose intolerant
            7. Allergic to peanuts
            8. Avoiding processed sugar`,
    ASK_ABOUT_HEIGHT: `OK, last question-- How tall are you? I'm 5 foot 11, so I would just enter 5 1 1 on
        the keypad. Go ahead and enter your height, then press pound.`,
    THANK_YOU: `Word. Thanks for sharing some of your vitals with a homie. I've saved your profile and
        I'll shoot ya over to products now. They'll take good care of ya. Have a blessed day and
        stay hydrated out there!`

};

const DIETARY_RESTRICTIONS = {
    'sugar': 8
};

ricardo.post('/', twilio.webhook({ validate: false }), (req, res) => {
    let twiml = new twilio.TwimlResponse();
    twiml.say(sayings.HELLO, RICARDO_VOICE);
    agent.ask(twiml, RICARDO, 'workout-frequency', sayings.ASK_ABOUT_WORKOUT_FREQUENCY);
    res.send(twiml);
});

ricardo.post('/workout-frequency', twilio.webhook({ validate: false }), (req, res) => {
    let twiml = new twilio.TwimlResponse();
    let workoutFrequency = parseInt(req.body.Digits);

    agent.saveResponse(req.body.Caller, 'workout-frequency', workoutFrequency);

    if (workoutFrequency === 0) {
        twiml.say(`Gotcha. I feel that.`, RICARDO_VOICE);
    } else if (workoutFrequency === 1) {
        twiml.say(`Sweet! It feels good to get out there when you have time.`, RICARDO_VOICE);
    } else if (workoutFrequency === 2 || workoutFrequency === 3) {
        twiml.say(`Nice! So you must be pretty cut.`, RICARDO_VOICE);
    } else {
        twiml.say(`Wow! That's great. It feels good to feel good.`, RICARDO_VOICE);
    }

    agent.ask(twiml, RICARDO, 'meals-per-day', sayings.ASK_ABOUT_MEALS_PER_DAY);
    res.send(twiml);
});

ricardo.post('/meals-per-day', twilio.webhook({ validate: false }), (req, res) => {
    let twiml = new twilio.TwimlResponse();
    let mealsPerDay = parseInt(req.body.Digits);

    agent.saveResponse(req.body.Caller, 'meals-per-day', mealsPerDay);

    if (isNan(mealsPerDay)) {
        agent.ask(twiml, RICARDO, 'meals-per-day', `Sorry, I didn't catch that. How many meals do
            you eat per day? Enter the number on the keypad.`);
        res.send(twiml);
        return;
    }

    if (mealsPerDay < 2) {
        twiml.say(`Really? You must be starving, bro! I bet your body fat percentage is pretty
            sick, though.`, RICARDO_VOICE);
    } else if (mealsPerDay === 2) {
        twiml.say(`Legit. Two big ones. Right on.`, RICARDO_VOICE);
    } else if (mealsPerDay === 3) {
        twiml.say(`Nice, old school. Works for me.`, RICARDO_VOICE);
    } else if (mealsPerDay === 4) {
        twiml.say(`Fourthmeal, eh? Hope it's not T-Bell. Haha!`, RICARDO_VOICE);
    } else if (mealsPerDay >= 5) {
        twiml.say(`Way to be, way to be. I know the feeling when your CNS is totally jacked up
            and you just can't stay full. Legit.`, RICARDO_VOICE);
    }

    agent.ask(twiml, RICARDO, 'body-fat-percentage', sayings.ASK_ABOUT_BODY_FAT_PERCENTAGE);
    res.send(twiml);
});

ricardo.post('/body-fat-percentage', twilio.webhook({ validate: false }), (req, res) => {
    let twiml = new twilio.TwimlResponse();
    let bodyFatPercentage = parseInt(req.body.Digits);
    let workoutFrequency = agent.retrieveResponse(req.body.Caller, 'workout-frequency');

    agent.saveResponse(req.body.Caller, 'body-fat-percentage', bodyFatPercentage);

    if (bodyFatPercentage < 10) {
        twiml.say(`Whaaaaaatt! I bet you have amazing abdominal definition. Working out
            ${workoutFrequency} times a day helps too!`, RICARDO_VOICE);
    } else if (bodyFatPercentage >= 10 && bodyFatPercentage < 15) {
        twiml.say(`Yep! You're pretty healthy, huh?`, RICARDO_VOICE);
    } else if (bodyFatPercentage >= 15) {
        twiml.say(`Alright, we can work with that.`, RICARDO_VOICE);
    } else {
        twiml.say(`OK, cool. Don't worry, we'll still find something great for ya.`, RICARDO_VOICE);
    }

    agent.ask(twiml, RICARDO, 'dietary-restrictions', sayings.ASK_ABOUT_DIETARY_RESTRICTIONS);
    res.send(twiml);
});

ricardo.post('/dietary-restrictions', twilio.webhook({ validate: false }), (req, res) => {
    let twiml = new twilio.TwimlResponse();
    let dietaryRestrictionList = req.body.Digits;

    if (dietaryRestrictionList.length === 0) {
        twiml.say(`Admirable. These days everybody's afraid to eat anything.`, RICARDO_VOICE);
    } else if (dietaryRestrictionList.length === 1) {
        twiml.say(`That's fair. It's good to be focused about what you eat and don't eat.`, RICARDO_VOICE);
    } else if (dietaryRestrictionList.length === 2) {
        twiml.say(`That must be tough. Kudos for sticking with it, though.`, RICARDO_VOICE);
    } else if (dietaryRestrictionList.length >= 3) {
        twiml.say(`Wow. Haha. Can you eat anything?`, RICARDO_VOICE);
    }

    if (dietaryRestrictionList.indexOf(DIETARY_RESTRICTIONS.sugar) > -1) {
        twiml.say(`Word, I'm trying to stay away from sugar too.`, RICARDO_VOICE);
    }

    agent.ask(twiml, RICARDO, 'height', sayings.ASK_ABOUT_HEIGHT);
    res.send(twiml);
});

ricardo.post('/height', twilio.webhook({ validate: false }), (req, res) => {
    let twiml = new twilio.TwimlResponse();
    let height = req.body.Digits;
    let feet = parseInt(height.substr(0, 1));
    let inches = parseInt(height.substr(1, 3));

    if (feet < 5) {
        twiml.say(`I'm getting a clearer picture of you now. It kinda looks like my grandma.
            Haha! J K.`, RICARDO_VOICE);
    } else if (feet === 5) {
        twiml.say(`Right about average.`, RICARDO_VOICE);
    } else if (feet === 6 && inches < 6) {
        twiml.say(`Cool, cool.`, RICARDO_VOICE);
    } else if ((feet === 6 && inches >= 6) || feet > 6) {
        twiml.say(`You must bump your head on all sorts of stuff. I bet you really ball
            out though! Sker sker!`, RICARDO_VOICE);
    }

    agent.transferToProducts(twiml, RICARDO, sayings.THANK_YOU);
    res.send(twiml);
});

module.exports = ricardo;