var mongoose = require('mongoose');
var Schema = mongoose.Schema;
passportLocalMongoose = require('passport-local-mongoose');

var User = new Schema({
    //username and password added automatically by passport plugin
    admin: {
        type: Boolean,
        default: false
    }
});

User.plugin(passportLocalMongoose); //usign hash and salt

module.exports = mongoose.model('User', User);
