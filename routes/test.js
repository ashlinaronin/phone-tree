const ConsumerProfile = require('../models/ConsumerProfile');
const sms = require('../services/sms');
const productHelpers = require('../services/product-helpers');

let testRoutes = require('express').Router();

testRoutes.get('/sms', function(req, res, next) {
    sms.sendProduct('+15093414961', 'http://587f4810.ngrok.io/')
        .then(msg => res.send(msg))
        .catch(err => res.status(500).send(err.message));
});

testRoutes.get('/save-product', function(req, res, next) {
    let testProduct = {
        phone: '+15093414961',
        timestamp: new Date(),
        color: '#0000ff',
        customRegion: 'base',
        imageSearchTerm: 'poop',
        shape: 'massager'
    };

    productHelpers.saveProduct(testProduct)
        .then(msg => res.send({ success: true, message: msg }))
        .catch(err => res.status(500).send({ success: false, message: err.message }));
});

module.exports = testRoutes;
