var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var User = require('./models/user');

//you can supply your own function auth, but passport proovides that kind of function
exports.local = passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


