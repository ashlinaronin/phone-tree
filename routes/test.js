const ConsumerProfile = require('../models/ConsumerProfile');
const sms = require('../services/sms');

let testRoutes = require('express').Router();

testRoutes.get('/sms', function(req, res, next) {
    sms.sendProduct('+15093414961', 'http://587f4810.ngrok.io/')
        .then(msg => res.send(msg))
        .catch(err => res.status(500).send(err));
});

testRoutes.get('/save-product', function(req, res, next) {

    ConsumerProfile.saveProduct({
        phone: '+15093414961',
        timestamp: new Date(),
        color: '#0000ff',
        shape: 'cactus'
    });

    res.send({ok: 'ok'});

});

module.exports = testRoutes;
