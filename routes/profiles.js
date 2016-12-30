const ConsumerProfile = require('../models/ConsumerProfile');
let profiles = require('express').Router();

// Grab all the latest profile data and dump out as JSON
profiles.get('/', function(req, res, next) {
    ConsumerProfile.find({}).limit(100).exec(function(err, docs) {
        if (err) {
            res.status(500).send(err);
        } else {
            res.send({
                profiles: docs
            });
        }
    });
});

module.exports = profiles;