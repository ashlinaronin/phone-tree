const ConsumerProfile = require('../models/ConsumerProfile');
let productDetails = require('express').Router();

// Grab all the saved products for this phone number
productDetails.get('/:phoneNumber', function(req, res, next) {
    ConsumerProfile
        .findOne({ phone: req.params.phoneNumber })
        .limit(100)
        .exec(function(err, profile) {
            if (err) {
                res.status(500).send(err.message);
            } else {
                res.send(profile.products);
            }
        });
});

module.exports = productDetails;