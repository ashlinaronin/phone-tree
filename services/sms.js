const config = require('../config');
let twilioRestClient = require('twilio')(config.TWILIO_ACCOUNT_SID, config.TWILIO_AUTH_TOKEN);

function sendProduct(customerPhone, productId) {
    const url = constructProductUrl(productId);
    return sendMessage(customerPhone, url);
}

function sendMessage(customerPhone, productUrl) {
    return new Promise(function (resolve, reject) {
        twilioRestClient.messages.create({
            to: customerPhone,
            from: config.TWILIO_FROM_PHONE,
            body: `Thanks for ordering with Nectar! View your new product here: ${productUrl}`
        }, (error, message) => {
            if (error) {
                reject(error);
            } else {
                resolve(message);
            }
        });
    });
}

function constructProductUrl(productId) {
    return `https://nectar.shop/product/?id=${productId}`;
}

module.exports = {
    sendProduct
};