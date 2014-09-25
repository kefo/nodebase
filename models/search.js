var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var SearchSchema = new Schema({
    subject: String,
    predicate: String,
    object: { type: String, index: true },
    graph:  String
});

module.exports = mongoose.model('quad', SearchSchema);