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
        imageSearchTerm: 'poop',
        shape: 'basketball'
    };

    productHelpers.saveProduct(testProduct)
        .then(msg => res.send({ success: true, message: msg }))
        .catch(err => res.status(500).send({ success: false, message: err.message }));
});

testRoutes.get('/save-product/no-image-search', function(req, res, next) {
    let testProduct = {
        agent: 'ricardo',
        phone: '+15093414961',
        customRegion: 'Material__3',
        imageSearchTerm: 'poop',
        shape: 'footballv2',
        imageUrl: 'img/products/Donate-Poop-for-Money.jpg'
    };

    productHelpers.saveProductWithoutImageQuery(testProduct)
        .then(msg => res.send({ success: true, message: msg }))
        .catch(err => res.status(500).send({ success: false, message: err.message }));
});

testRoutes.get('/fix-products', function (req, res, next) {
    Promise.all([
        updateProductShape('footballv2', 'football2.0'),
        updateProductShape('basketball_v2', 'basketball2.0')
    ]).then(response => {
        res.send(response);
    }).catch(err => {
        next(err);
    })
});

function updateProductShape(oldShape, newShape) {
    return ConsumerProfile
        .find(
            {
                products: {
                    $elemMatch: {
                        shape: oldShape
                    }
                }
            }
        )
        .exec()
        .then(profiles => {
            return Promise.all(profiles.map(profile => {
                profile.products.forEach(product => {
                    if (product.shape === oldShape) {
                        product.shape = newShape;
                    }
                });
                return profile.save();
            }));
        });
}

module.exports = testRoutes;
