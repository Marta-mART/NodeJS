var express = require('express');
const bodyParser = require('body-parser');
var User = require('../models/user');

var router = express.Router();
router.use(bodyParser.json());

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/signup', (req,res, next) => {
  User.findOne({username: req.body.username})
  .then((user) => {
    //if user already exists and catch error
    if( user != null) {
      var err = new Error('User ' + req.body.username + ' already exists');
      err.status = 403;
      next(err);
    }
    else {
      //sign up user
      return User.create({
        username: req.body.username,
        password: req.body.password
      })
    }
  })
  .then((user) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    //Made up now - to send back
    res.json({status: 'Registration Successfull', user: user});
  }, (err) => next(err))
  .catch((err) => next(err));
});







router.post('/login', (req,res,next) => {
  //user not set in session
  if(!req.session.user) {
    var authHeader = req.headers.authorization;
    //Auth header doesn't exist
    if(!authHeader) {
      var err = new Error('You are not authenticated!');
      res.setHeader('WWW-Authenticate', 'Basic');
      err.status = 401;
      return next(err);
    }

    //split user name and password into array of two items
    //extract from base64 string
    //split user and password

    //req.headers.authorization returned for me: Basic dXNlcm5hbWU6cGFzc3dvcmQ=. Not just the base64 string

    var auth = Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':');
    var username = auth[0];
    var password = auth[1];

    //Check if such a user exists
    User.findOne({username: username})
    .then((user) => {
      //is user found?
      if(user === null) {
        var err = new Error('User ' + username + ' does not exist!');
        err.status = 403;
        return next(err);
      }
      //correct password
      else if (user.password !== password)  {
        var err = new Error('Your password is incorrect!');
        err.status = 403;
        return next(err);
      } 
      //first arg and second should be true
      //double check
      else if(user.username === username && user.password === password) {
        //set session with values
        req.session.user = 'authenticated';
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/plain');
        res.end('You are authenticated');      
      }     
    })
    .catch((err) => next(err));    
  }
  //user set in session - logged in earlier
  else {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    res.end('You are already authenticated!');

  }
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
