const ConsumerProfile = require('../models/ConsumerProfile');
let productDetails = require('express').Router();

// Grab all the latest profile data and dump out as JSON
productDetails.get('/:id', function(req, res, next) {

    res.send({
        object: 'cactus',
        color: 0xff0000
    });

    // ConsumerProfile.find({}).limit(100).exec(function(err, docs) {
    //     if (err) {
    //         res.status(500).send(err);
    //     } else {
    //         res.send({
    //             profiles: docs
    //         });
    //     }
    // });
});

module.exports = productDetails;