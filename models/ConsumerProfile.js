const mongoose = require('mongoose');

let ConsumerProfileSchema = new mongoose.Schema({
    phone: String,
    responses: [
        {
            question: String,
            answer: mongoose.Schema.Types.Mixed,
            timestamp: Date
        }
    ]
});

ConsumerProfileSchema.statics.saveResponse = function(newEntry) {
    // TODO: use promises?
    let consumerProfile;

    ConsumerProfile.findOne({
        phone: newEntry.phone
    }, function (err, doc) {
       consumerProfile = doc || new ConsumerProfile({ phone: newEntry.phone });

       let newResponse = {
           question: newEntry.question,
           answer: newEntry.answer,
           timestamp: new Date()
       };

       consumerProfile.responses.push(newResponse);

       consumerProfile.save(function(err) {
           if (err) {
               console.log('error saving consumer profile...');
           } else {
               console.log(
                   `saved new response to consumer profile:
                    Q. ${newResponse.question}
                    A. ${newResponse.answer}`
               );
           }
       })
    });
};

ConsumerProfileSchema.statics.retrieveResponse = function(phone, q) {
    // TODO: will this work? callback structure
    ConsumerProfile.findOne({ phone: phone, question: q }, (err, doc) => {
        return doc;
    });
};

let ConsumerProfile = mongoose.model('ConsumerProfile', ConsumerProfileSchema);
module.exports = ConsumerProfile;