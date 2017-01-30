const ConsumerProfile = require('../models/ConsumerProfile');
let productDetails = require('express').Router();

// Grab all the saved products for this phone number
productDetails.get('/:productReadableId', function(req, res, next) {
    ConsumerProfile
        .findOne(
            {
                products: {
                    $elemMatch: {
                        readableId: req.params.productReadableId
                    }
                }
            }
        )
        .exec()
        .then(profile => {
            let product = profile.products.find(p => p.readableId === req.params.productReadableId);
            res.send(product);
        })
        .catch(err => {
            res
                .status(500)
                .send({ error: err.message });
        });

});

module.exports = productDetails;