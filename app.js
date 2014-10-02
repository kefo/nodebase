// dependencies
var path = require('path');
var express = require('express');
var http = require('http');
var mongoose = require('mongoose');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var MongoStore = require('connect-mongo')(express);

// main config
var app = express();
app.set('port', process.env.PORT || 8000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.set('view options', { layout: false });
app.use(express.logger());
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser('your secret here'));
//app.use(express.session({cookie: { maxAge: 604800 }})); // one week
app.use(express.session({
  store: new MongoStore({
    url: 'mongodb://localhost/nodebase'
  }),
    secret: "Mary had little lamb, little lamb",
    cookie: { maxAge: 24 * 60 * 60 * 1000 },
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

app.configure('development', function(){
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
    app.use(express.errorHandler());
});

//var Search = require('./models/search');

/*
var triple_data = {
    subject: "http://example.org/1",
    predicate: "http://example.org/vocab/type",
    object: "My kingdom for my vanity!",
    graph:  "http://example.org/graph"
}

var triple = new Search(triple_data);

triple.save( function(error, data){
    if(error){
        console.log("Error saving");
        console.log(error);
    }
    else{
        console.log("Triuple saved");
        console.log(data);
    }
});
*/

// passport config
var Account = require('./models/account');
passport.use(new LocalStrategy(Account.authenticate()));
passport.serializeUser(Account.serializeUser());
passport.deserializeUser(Account.deserializeUser());

// mongoose
mongoose.connect('mongodb://localhost/nodebase');

app.use(function(req, res, next){
    req.session.touch();
    next();
});
// routes
require('./routes')(app);

app.listen(app.get('port'), function(){
  console.log(("Express server listening on port " + app.get('port')))
});
