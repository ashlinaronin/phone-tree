const ConsumerProfile = require('../models/ConsumerProfile');
const imageSearch = require('./image-search');

function saveProduct(productModel) {
    return imageSearch.saveImageForQuery(productModel.imageSearchTerm)
        .then(savedImageUrl => {
            productModel.imageUrl = savedImageUrl;
            return ConsumerProfile.saveProduct(productModel);
        })
        .catch(err => {
            console.log('Error saving product image', err);
        });
}

function saveProductWithoutImageQuery(productModel) {
    return ConsumerProfile.saveProduct(productModel);
}

function getProduct(phone) {
    return ConsumerProfile.getLatestProduct(phone);
}

module.exports = {
    getProduct,
    saveProduct,
    saveProductWithoutImageQuery
};