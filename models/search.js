var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var SearchSchema = new Schema({
    subject: String,
    predicate: String,
    object: String,
    graph:  String
});

SearchSchema.set('autoIndex', true);
mongoose.set('debug', true);

//SearchSchema.index( { object : 'text', subject: 'text' });

/*
var schemamodel = mongoose.model('quad', SearchSchema); 
schemamodel.collection.ensureIndex({object: 'text'}, function(error) {
    if (error) {
        console.log("Error ensuring index.");
    }
});
*/

module.exports = mongoose.model('quads', SearchSchema);