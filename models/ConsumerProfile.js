const mongoose = require('mongoose');

let ProductSchema = new mongoose.Schema({
    shape: String,
    customRegion: String,
    imageUrl: String,
    color: String,
    timestamp: Date
});

let ConsumerProfileSchema = new mongoose.Schema({
    phone: String,
    responses: [
        {
            question: String,
            answer: mongoose.Schema.Types.Mixed,
            timestamp: Date
        }
    ],
    products: [ProductSchema]
});

ConsumerProfileSchema.statics.saveResponse = function(newEntry) {
    let newResponse = {
        question: newEntry.question,
        answer: newEntry.answer,
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
    return ConsumerProfile
        .findOne({ phone: phone, responses: { question: q} })
        .exec();
};

ConsumerProfileSchema.statics.saveProduct = function(productModel) {
    return ConsumerProfile
        .findOne({ phone: productModel.phone })
        .exec()
        .then(profile => {
            profile.products.push(productModel);
            return profile.save();
        });
};

let ConsumerProfile = mongoose.model('ConsumerProfile', ConsumerProfileSchema);
module.exports = ConsumerProfile;