var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var User = require('./models/user');
//json web token strategy for confugere passport
var JwtStrategy = require('passport-jwt').Strategy;
var ExtractJwt = require('passport-jwt').ExtractJwt;
var jwt = require('jsonwebtoken');
var FacebookTokenStrategy = require('passport-facebook-token');


var config = require('./config');

//you can supply your own function auth, but passport proovides that kind of function
exports.local = passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//i don't know what this module is for

//user - json object
exports.getToken = function(user) {
    return jwt.sign(user, config.secretKey, {expiresIn: 3600});
};

var opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = config.secretKey;

exports.jwtPassport = passport.use(new JwtStrategy(opts, 
    (jwt_payload, done) => {
        console.log("JWT payload: ", jwt_payload);
        //lok for user in db
        User.findOne({_id: jwt_payload._id}, (err,user) => {
            if(err) {
                return done(err, false);
            }
            else if (user) {
                //user we got from mongo db
                return done(null, user);
            }
            else { //we could not find user
                return done(null, false);
            }
        })
    }));
    
    //uses token that comes in in auth header and vrifies user
    exports.verifyUser = passport.authenticate('jwt', {session: false});

    //verifyAdmin - id veryfied user
    //admin? chceck flag rec.user.admin true? 
    exports.verifyAdmin = function(req,res,next) {
       if(req.user.admin) //if user is admin
        return next();
       else {
            err = new Error('You are not autorized to perform this operation - you are not admin');
            err.status = 403;
            return next(err);
       }
    };

    exports.facebookPassport = passport.use(new FacebookTokenStrategy({
        clientID: config.facebook.clientId,
        clientSecret: config.facebook.clientSecret
    }, (accessToken, refreshToken, profile, done) => {
        //if fb user logged earlier
        //profile - many useful functions
        User.findOne({facebookId: profile.id}, (err,user) => {
            if(err) return done(err,false);
            if (!err &user != null) return done(null, user);
            else { //if user doesn't exist, create user
                user = new User({ username: profile.displayName });
                user.facebookId = profile.id;
                user.firstname = profile.name.givenName;
                user.lastname = profile.name.familyName;
                user.save( (err, user) => { //save returns err or user
                    if(err) return done (err,false); //we didn't managed to create user
                    else done(null, user); //user created
                })
            }
           
        });
    }
    ));