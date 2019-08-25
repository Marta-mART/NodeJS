var express = require('express');
const bodyParser = require('body-parser');
var User = require('../models/user');
var passport = require('passport');
var authenticate = require('../authenticate');

var router = express.Router();
router.use(bodyParser.json());

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/signup', (req,res, next) => {
  User.register(new User ({username: req.body.username}),
    req.body.password, (err,user) => {
    //if registration not proper
    if(err) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.json({err:err}); //construct json obj with json obj
    }
    //authenticate user
    else {
      passport.authenticate('local')(req,res, () => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        //Made up now - to send back
        //success flag to check if registration was successful
        res.json({success: true, status: 'Registration Successfull'});
      });
    }
  });
  
});


//passport.authenticate('local') will automatically add to req ".user" property
//and store it in the session
router.post('/login', passport.authenticate('local'), (req,res,next) => {
  
  var token = authenticate.getToken({_id: req.user._id}); //user id is enough to create json web token
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  //Made up now - to send back
  //success flag to check if registration was successful
  res.json({success: true, token: token, status: 'You are logged in!'});
});


//get on logout - because you don't supply information
router.get('/logout', (req,res) => {
  //session must exist, because otherwise you try to log out user who is not logged in
  //that doesn't make sense
  if(req.session) {
    req.session.destroy(); //info removed and invalid, cookies deleted
    res.clearCookie('session-id'); //ask to delete from the client side
    res.redirect('/'); //redirect on index
  }
  else {
    var err = new Error('You are not logged in!');
    err.status = 403;
    next(err);
  }
})
module.exports = router;
