var passport = require('passport');
var Account = require('./models/account');
var Search = require('./models/search');
var rdfstore = require('rdfstore');

module.exports = function (app) {
    
    app.get('/', function (req, res) {
        res.render('index', { user : req.user, error : req.query.error });
    });

    app.get('/register', 
        passport.authenticate('local', { failureRedirect: '/?error=1002' }),
        function(req, res) {
            res.render('register', { });
        }
    );

    app.post('/register', 
        passport.authenticate('local', { failureRedirect: '/?error=1002' }),
        function(req, res) {
            Account.register(new Account({ username : req.body.username }), req.body.password, function(err, account) {
                if (err) {
                    return res.render("register", {info: "Sorry. That username already exists. Try again."});
                }
                passport.authenticate('local')(req, res, function () {
                    res.redirect('/');
                });
            });
        }
    );

    app.get('/login', function(req, res) {
        res.render('login', { user : req.user });
    });

    app.post('/login', function(req, res, next) {
        //passport.authenticate('local', {successRedirect: '/', failureRedirect: '/', failureFlash: 1}), 
            passport.authenticate('local', function(err, user, info) {
                if (err) {
                    return next(err); // will generate a 500 error
                }
                // Generate a JSON response reflecting authentication status
                if (! user) {
                    // return res.send({success: false, message: 'authentication failed'});
                    //return res.redirect('/?error=1001');
                    return res.render('index', { message: info.message })
                }
                // return res.send({ success : true, message : 'authentication succeeded' });
                //return res.redirect('/');
                req.logIn(user, function(err) {
                    if (err) { return next(err); }
                    return res.redirect('/');
                });
            })(req, res, next);
    });

    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });

    app.get('/ping', function(req, res){
        res.send("pong!", 200);
    });
    
    app.get(/^\/resources\/([\w]+)$/, function (req, res, next) {
        console.log("Match");
        new rdfstore.Store(
            {   
                persistent:true, 
                engine:'mongodb', 
                name:'nodebase', // quads in MongoDB will be stored in a DB named myappstore
                overwrite:false,    // delete all the data already present in the MongoDB server
                mongoDomain:'localhost', // location of the MongoDB instance, localhost by default
                mongoPort:27017 // port where the MongoDB server is running, 27017 by default
            }, function(store) {
                    var rdfabout = "http://example.org/" + req.params[0];
                    /*
                    var query = "SELECT * WHERE { \
                                    <" + rdfabout + "> ?p ?o .\
                                    OPTIONAL { ?o ?p2 ?o2 } \
                                }";
                    */
                    var query = "SELECT * WHERE { <" + rdfabout +"> ?p ?o }";
                    console.log(query);
                    store.execute(query, function(success, results){
                        if(success) {
                            //console.log(results);
                            for (t in results) {
                                console.log(results[t]);
                                if (results[t].o.token == "uri") {
                                    if (results[t].o.value.indexOf("http://example.org") > -1) {
                                        results[t].o.href = results[t].o.value.replace("http://example.org", "http://localhost:8000/resources");
                                    } else {
                                        results[t].o.href = results[t].o.value;
                                    }
                                }
                            }
                            res.render('resource', { subject: rdfabout, triples: results });
                        }
                    });
                }
        );
    });
    
    app.get("/search/", function(req, res) {
        var query = req.query.q;
        /*
        Search
            .find(
                { $text : { $search : "Nesmrtelnost" } }, 
                { score : { $meta: "textScore" } }
            )
            .sort({ score : { $meta : 'textScore' } })
            .exec(function(err, results) {
                // callback
                if (err) {
                    console.log(err);
                }
                console.log(results);
            });
        */
        Search
            .find(
                { "text" : { "search" : "Nesmrtelnost" } }
            )
            .exec(function(err, results) {
                // callback
                if (err) {
                    console.log(err);
                }
                console.log(results);
            });
    })

};
