var mongoose = require('mongoose');
var rdfstore = require('rdfstore');
var _ = require('lodash');

var Schema = mongoose.Schema;

var ResourceSchema = new Schema({
    subject: String,
    predicate: String,
    object: String,
    graph:  String
});

ResourceSchema.set('autoIndex', true);
mongoose.set('debug', true);

var resourcemodel = mongoose.model('quads', ResourceSchema);

resourcemodel.describe = function(uris, cb) {
    var resources = [];
    new rdfstore.Store(
        {   
            persistent:true, 
            engine:'mongodb', 
            name:'nodebase', // quads in MongoDB will be stored in a DB named myappstore
            overwrite:false,    // delete all the data already present in the MongoDB server
            mongoDomain:'localhost', // location of the MongoDB instance, localhost by default
            mongoPort:27017 // port where the MongoDB server is running, 27017 by default
        }, function(store) {
            uris.forEach(function(uri) {
                var r = {};
                //r.po = [];
                console.log("URI is " + uri._id);
                var rdfabout = uri._id.replace('u:', '');
                r.s = rdfabout;
                r.link = rdfabout.replace("http://example.org", "http://localhost:8000/resources");
                var query = "SELECT * WHERE { <" + rdfabout +"> ?p ?o }";
                // var query = "CONSTRUCT { <" + rdfabout +"> ?p ?o } WHERE { <" + rdfabout +"> ?p ?o }";
                //console.log(query);
                store.execute(query, function(success, results){
                    if(success) {
                        //console.log(results);
                        for (var t in results) {
                            //console.log(results[t]);
                            if (results[t].o.token == "uri") {
                                if (results[t].o.value.indexOf("http://example.org") > -1) {
                                    results[t].o.href = results[t].o.value.replace("http://example.org", "http://localhost:8000/resources");
                                } else {
                                    results[t].o.href = results[t].o.value;
                                }
                            }
                        }
                        r.po = results;
                        var label = "";
                        for (var t in results) {
                            if (results[t].p.value.indexOf("authorized") > -1 && ( results[t].o.lang && results[t].o.lang.indexOf("hash") < 0 )) {
                                console.log(results[t].p);
                                console.log(results[t].o);
                                label = results[t].o.value;
                            }
                            if (label === "" && results[t].p.value.indexOf("label") > -1) {
                                console.log(results[t].p);
                                label = results[t].o.value;
                            }
                            if (label === "" && results[t].p.value.indexOf("Value") > -1) {
                                console.log(results[t].p);
                                label = results[t].o.value;
                            }
                            if (label === "" && results[t].p.value.indexOf("title") > -1) {
                                console.log(results[t].p);
                                label = results[t].o.value;
                            }
                        }
                        r.label = label;
                        resources.push(r);
                        console.log(r);
                        //res.render('resource', { subject: rdfabout, triples: results });
                    }
                    if (uris.length === resources.length) {
                        cb(null, resources);
                    }
                });
            }
        );
    });
    //console.log(resources);
}
//SearchSchema.index( { object : 'text', subject: 'text' });

/*
var schemamodel = mongoose.model('quad', SearchSchema); 
schemamodel.collection.ensureIndex({object: 'text'}, function(error) {
    if (error) {
        console.log("Error ensuring index.");
    }
});
*/

//module.exports = mongoose.model('quads', ResourceSchema);
module.exports = resourcemodel;