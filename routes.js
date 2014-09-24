var passport = require('passport');
var Account = require('./models/account');

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

};
