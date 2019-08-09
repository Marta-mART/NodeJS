const express = require('express');
const bodyParser = require('body-parser');

const dishRouter = express.Router();

dishRouter.use(bodyParser.json());

dishRouter.route('/')
//this code exectuted first by default
.all( (req, res, next) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain'); //we send client plain text
    next(); //continue to look for specifications down below for dishes
})
.get((req,res,next) => {
    res.end('Will send all the dishes to you!');
})
//Post new dish to server
.post((req,res,next) => {
    //extract info from body
    res.end('Will add the dish: ' + req.body.name + 
        ' with details: ' + req.body.description);
})
.put((req,res,next) => {
    //extract info from body
    res.statusCode = 403; //server understood, but operation is forbidden
    res.end('PUT operation not supported on /dishes');
})
//Dangerous operation
.delete((req,res,next) => {
    res.end('Deleting all the dishes!');
})


dishRouter.route('/:dishId')
.get((req,res,next) => {
    res.end('Will send details of the dish: '
         + req.params.dishId +' to you!');
})
//Post new dish to server
.post((req,res,next) => {
    res.statusCode = 403;
    res.end('POST operation not supported on /dishes/'
        + req.params.dishId);
})
.put((req,res,next) => {
    //extract info from body
    res.write('Updating the dish: ' + req.params.dishId + '\n');
  res.end('Will update the dish: ' + req.body.name + 
        ' with details: ' + req.body.description);
})
//Dangerous operation
.delete((req,res,next) => {
    res.end('Deleting dish: ' + req.params.dishId);
});


module.exports = dishRouter;