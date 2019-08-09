const express = require('express');
const bodyParser = require('body-parser');

const leaderRouter = express.Router();

leaderRouter.use(bodyParser.json());


leaderRouter.route('/')
//this code exectuted first by default
.all( (req, res, next) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain'); //we send client plain text
    next(); //continue to look for specifications down below for dishes
})
.get((req,res,next) => {
    res.end('Will send all the leaders to you!');
})
//Post new leader to server
.post((req,res,next) => {
    //extract info from body
    res.end('Will add the leader: ' + req.body.name + 
        ' with details: ' + req.body.description);
})
.put((req,res,next) => {
    //extract info from body
    res.statusCode = 403; //server understood, but operation is forbidden
    res.end('PUT operation not supported on /leaders');
})
//Dangerous operation
.delete((req,res,next) => {
    res.end('Deleting all the leaders!');
});



leaderRouter.route('/:leaderId')
//this code exectuted first by default
.all( (req, res, next) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain'); //we send client plain text
    next(); //continue to look for specifications down below for dishes
})
.get((req,res,next) => {
    res.end('Will send details of the leader: '
    + req.params.leaderId +' to you!');
})
//Post new leader to server
.post((req,res,next) => {
    res.statusCode = 403;
    res.end('POST operation not supported on /leaders/'
        + req.params.leaderId);
})
.put((req,res,next) => {
    //extract info from body
    res.write('Updating the leader: ' + req.params.leaderId + '\n');
  res.end('Will update the leader: ' + req.body.name + 
        ' with details: ' + req.body.description);
})
//Dangerous operation
.delete((req,res,next) => {
    res.end('Deleting leader: ' + req.params.leaderId);
});
