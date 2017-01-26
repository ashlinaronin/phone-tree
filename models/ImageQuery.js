const mongoose = require('mongoose');

let ImageQuerySchema = new mongoose.Schema({
    query: String,
    timestamp: Date,
    savedImageUrl: String
});

let ImageQuery = mongoose.model('ImageQuery', ImageQuerySchema);
module.exports = ImageQuery;