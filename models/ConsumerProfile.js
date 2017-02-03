const mongoose = require('mongoose');
const shortId = require('short-id');

let ProductSchema = new mongoose.Schema({
    shape: String,
    imageUrl: String,
    imageSearchTerm: String,
    color: String,
    timestamp: Date,
    readableId: String,
    agent: String,
});

let ConsumerProfileSchema = new mongoose.Schema({
    phone: String,
    responses: [
        {
            question: String,
            answer: mongoose.Schema.Types.Mixed,
            timestamp: Date,
            agent: String
        }
    ],
    products: [ProductSchema]
});

ConsumerProfileSchema.statics.saveResponse = function(newEntry) {
    let newResponse = {
        question: newEntry.question,
        answer: newEntry.answer,
        agent: newEntry.agent,
        timestamp: new Date()
    };

    return ConsumerProfile
        .findOne({ phone: newEntry.phone })
        .exec()
        .then(foundProfile => {
            let consumerProfile = foundProfile || new ConsumerProfile({ phone: newEntry.phone });
            consumerProfile.responses.push(newResponse);
            return consumerProfile.save();
        })
        .then(saveSuccessResponse => {
            console.log(
                `saved new response to consumer profile:
                    Q. ${newResponse.question}
                    A. ${newResponse.answer}`
            );
        })
        .catch(err => {
            console.error('error saving consumer profile...', err);
        });
};

ConsumerProfileSchema.statics.retrieveResponse = function(phone, q) {
    // TODO: only get latest response if many
    return ConsumerProfile
        .findOne({ phone: phone })
        .exec()
        .then(profile => {
            const response = profile.responses.find(r => r.question === q);
            return Promise.resolve(response.answer);
        })
        .catch(err => {
            console.log('error retrieving response', err);
        });
};



ConsumerProfileSchema.statics.saveProduct = function(productModel) {
    return ConsumerProfile
        .findOne({ phone: productModel.phone })
        .exec()
        .then(profile => {
            productModel.timestamp = new Date();
            productModel.readableId = shortId.generate();
            profile.products.push(productModel);
            return profile.save();
        })
        .catch(err => {
            console.log('error saving product', err);
        });
};

ConsumerProfileSchema.statics.getLatestProduct = function(phone) {
    return ConsumerProfile
        .findOne({ phone: phone })
        .exec()
        .then(profile => {
            // for now, just pick a product
            const latestProduct = profile.products[profile.products.length-1];
            // const latestProduct = profile.products.sort((p, q) => p.timestamp - q.timestamp);
            return latestProduct;
        })
        .catch(err => {
            console.log('error getting latest product', err);
        });
};

let ConsumerProfile = mongoose.model('ConsumerProfile', ConsumerProfileSchema);
module.exports = ConsumerProfile;