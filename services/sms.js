const config = require('../config');

let twilioRestClient = require('twilio')(config.TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

function sendProduct(customerPhone, productUrl) {
    return new Promise(function (resolve, reject) {
        twilioRestClient.messages.create({
            to: customerPhone,
            from: TWILIO_FROM_PHONE,
            body: `Thanks for ordering with us! View your new product here: ${productUrl}`
        }, (error, message) => {
            if (error) {
                reject(error);
            } else {
                resolve(message);
            }
        });
    });
}

module.exports = {
    sendProduct
};