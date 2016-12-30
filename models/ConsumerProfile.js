const mongoose = require('mongoose');

let ConsumerProfileSchema = new mongoose.Schema({
    phone: String,
    responses: [mongoose.Schema.Types.Mixed]
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
           answer: newEntry.answer
       };

       consumerProfile.responses.push(newResponse);

       consumerProfile.save(function(err) {
           if (err) {
               console.log('error saving consumer profile...');
           } else {
               console.log('saved consumer profile');
           }
       })
    });


};

let ConsumerProfile = mongoose.model('ConsumerProfile', ConsumerProfileSchema);
module.exports = ConsumerProfile;