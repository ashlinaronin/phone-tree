const rp = require('request-promise-native');
const geocodeEndpoint = 'https://maps.googleapis.com/maps/api/geocode/json';

function getLocality(zipcode) {
    const requestUrl = geocodeEndpoint + '?address=' + zipcode + '&key=' + process.env.GOOGLE_GEOCODE_KEY;
    return rp(requestUrl)
        .then((body) => {
            let addressComponents = JSON.parse(body).results[0].address_components;
            let localities = addressComponents.filter(c => c.types.indexOf('locality') > -1);
            return localities[0].long_name;
        });
}

module.exports = {
    getLocality
};
