var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    passportLocalMongoose = require('passport-local-mongoose'),
    bcrypt = require('bcrypt-nodejs');

var Account = new Schema({
    username: String,
    password: String,
    attempts: Number,
    last:  Date,
    roles: [String]
});

Account.plugin(passportLocalMongoose, {"limitAttempts": 1, "usernameLowerCase": 1});

module.exports = mongoose.model('Account', Account);