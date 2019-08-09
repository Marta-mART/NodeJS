const express = require('express');
const bodyParser = require('body-parser');

const promotionRouter = express.Router();

promotionRouter.use(bodyParser.json());


promotionRouter.route('/')
//this code exectuted first by default
.all( (req, res, next) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain'); //we send client plain text
    next(); //continue to look for specifications down below for dishes
})
.get((req,res,next) => {
    res.end('Will send all the promotions to you!');
})
//Post new promotion to server
.post((req,res,next) => {
    //extract info from body
    res.end('Will add the promotion: ' + req.body.name + 
        ' with details: ' + req.body.description);
})
.put((req,res,next) => {
    //extract info from body
    res.statusCode = 403; //server understood, but operation is forbidden
    res.end('PUT operation not supported on /promotions');
})
//Dangerous operation
.delete((req,res,next) => {
    res.end('Deleting all the promotions!');
});



promotionRouter.route('/:promoId')
//this code exectuted first by default
.all( (req, res, next) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain'); //we send client plain text
    next(); //continue to look for specifications down below for dishes
})
.get((req,res,next) => {
    res.end('Will send details of the promotion: '
    + req.params.promoId +' to you!');
})
//Post new promotion to server
.post((req,res,next) => {
    res.statusCode = 403;
    res.end('POST operation not supported on /promotions/'
        + req.params.promoId);
})
.put((req,res,next) => {
    //extract info from body
    res.write('Updating the promotion: ' + req.params.promoId + '\n');
  res.end('Will update the promotion: ' + req.body.name + 
        ' with details: ' + req.body.description);
})
//Dangerous operation
.delete((req,res,next) => {
    res.end('Deleting promotion: ' + req.params.promoId);
});

module.exports = promotionRouter;
