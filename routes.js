var passport = require('passport');
var Account = require('./models/account');
var Resource = require('./models/resource');
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
        var rdfabout = "http://example.org/" + req.params[0];
        var uris = [{ _id: 'u:' + rdfabout }];
        Resource.describe(uris, function(err, resources) {
            res.render('resource', { subject: rdfabout, triples: resources });
        });
    });
    
    app.get("/search/", function(req, res) {
        var query = req.query.q;
        console.log(query);
        if (query === undefined || query === "") {
            res.render('search', { msg: "Enter search term above.", resources: [] });
        } else {
            Resource.aggregate( [ 
                { $match: { $text: { $search: query } } }, 
                { $match: { subject: { $regex: 'u:.*'} } },
                { $sort: { score : { $meta : 'textScore' } } },
                { $group: { _id: "$subject" } } ,
                { $skip: 0 },
                { $limit: 10 }
            ])
            .exec(function(err, results) {
                // callback
                if (err) {
                    console.log("error encountered with search results");
                    console.log(err)
                }
                //console.log(results);
                if (results.length > 0) {
                    Resource.describe(results, function(err, resources) {
                        res.render('search', { resources: resources });
                    });
                } else {
                    console.log("No results found.")
                    res.render('search', { msg: "No results found.  Please try again.", resources: [] });
                }
            });
        }
    })

};
