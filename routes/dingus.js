var express = require('express');
var router = express.Router();
var twilio = require('twilio');

router.post('/welcome', twilio.webhook({validate: false}), function (request, response) {
    var twiml = new twilio.TwimlResponse();
    twiml.gather({
        action: '/dingus/menu',
        numDigits: '1',
        method: 'POST'
    }, function (node) {
        node.say('Welcome to the Dingus Hotline. Would you like to listen to a wonderful song? Press 1 for yes. Press 2 for no.');
    });
    response.send(twiml);
});

router.post('/menu', twilio.webhook({validate: false}), function (request, response) {
    var selectedOption = request.body.Digits;
    var optionActions = {
        '1': listenToSandstorm,
        '2': dontListenToSandstorm
    }

    if (optionActions[selectedOption]) {
        var twiml = new twilio.TwimlResponse();
        optionActions[selectedOption](twiml); // call selected fn and pass twiml
        response.send(twiml);
    } else {
        response.send(redirectWelcome());
    }
});

function listenToSandstorm (twiml) {
    twiml.say('Are you ready? Please wait a few moments while we prepare your song.', { voice: 'alice', language: 'en-GB' });
    twiml.play('/mp3/sandstorm.mp3');
    twiml.hangup();
    return twiml;
}

function dontListenToSandstorm (twiml) {
    twiml.say('I\'m sorry.');
    twiml.play('/mp3/astley.mp3');
    twiml.hangup();
    return twiml;
}

function redirectWelcome () {
    var twiml = new twilio.TwimlResponse();
    twiml.say("Returning to the main menu", {voice: "alice", language: "en-GB"});
    twiml.redirect("/dingus/welcome");
    return twiml;
}

module.exports = router;
