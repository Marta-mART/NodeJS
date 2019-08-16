var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');
var FileStore = require('session-file-store')(session);


var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var dishRouter = require('./routes/dishRouter');
var promoRouter = require('./routes/promoRouter');
var leaderRouter = require('./routes/leaderRouter');

const mongoose = require('mongoose');

const Dishes = require('./models/dishes');

const url = 'mongodb://localhost:27017/conFusion';
const connect = mongoose.connect(url);

connect.then((db) => {
  console.log('Connected correctly to server');
}, (err) => { console.log(err); });

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
//random value set by us
//app.use(cookieParser('12345-67890-09876-54321'));

//Sesion middleware
app.use(session({
  name: 'session-id',
  secret: '12345-67890-09876-54321',
  saveUnitialized: false,
  resave: false,
  store: new FileStore()
}));

//Auth
function auth(req,res, next) {
  console.log(req.session);

  //if signed cookie doesn't contain user in signed cookie
  //we will look in autho header for user
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

    if(username === 'admin' && password === 'password') {
      //set cookie with value
      req.session.user = 'admin';
      next(); //next middleware, express try to match to specific middleware that matches request
    }
    else {
      var err = new Error('You are not authenticated!');
      res.setHeader('WWW-Authenticate', 'Basic');
      err.status = 401;
      return next(err);
    }
  }
  //signed cookie exists and user is defines
  else
  {
    if(req.session.user === 'admin') //if signed cookie correct info
      next();
    else { //bad cookie with incorrect info user and password
      var err = new Error('You are not authenticated!');
      res.setHeader('WWW-Authenticate', 'Basic');
      err.status = 401;
      return next(err);
    }
  }

  
}

app.use(auth); //function we implement

//serve static data from public folder
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/dishes', dishRouter);
app.use('/promotions', promoRouter);
app.use('/leaders', leaderRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
