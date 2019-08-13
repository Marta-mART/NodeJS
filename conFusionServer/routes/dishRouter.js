const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const Dishes = require('../models/dishes');

const dishRouter = express.Router();

dishRouter.use(bodyParser.json());

dishRouter.route('/')
.get((req,res,next) => {
    Dishes.find({})
    .then((dishes) => {
        //OK operation find completed
        res.statusCode = 200;
        //return value as json
        res.setHeader('Content-Type', 'application/json');
        res.json(dishes);
    }, (err) => next(err))
    .catch((err) => next(err)); //if error returned pass error to overall error handler in app
})
//Post new dish to server
.post((req,res,next) => {
    Dishes.create(req.body)
    .then((dish) => { //if the dish returned correctly
        console.log('Dish Created', dish);
        res.statusCode = 200;
        //return value as json
        res.setHeader('Content-Type', 'application/json');
        res.json(dish); //client deals with what is returned in the dish on the client side
    },  (err) => next(err))
    .catch((err) => next(err));
   
})
.put((req,res,next) => {
    //extract info from body
    res.statusCode = 403; //server understood, but operation is forbidden
    res.end('PUT operation not supported on /dishes');
})
//Dangerous operation
.delete((req,res,next) => {
    //dangerous operation - remove all
   Dishes.remove({})
   .then((resp) => {
        res.statusCode = 200;   
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);    
   }, (err) => next(err))
   .catch((err) => next(err));
})


dishRouter.route('/:dishId')
.get((req,res,next) => {
    Dishes.findById(req.params.dishId)
    .then((dish) => { //if the dish returned correctly
        res.statusCode = 200;
        //return value as json
        res.setHeader('Content-Type', 'application/json');
        res.json(dish); //client deals with what is returned in the dish on the client side
    },  (err) => next(err))
    .catch((err) => next(err));
})
//Post new dish to server
.post((req,res,next) => {
    res.statusCode = 403;
    res.end('POST operation not supported on /dishes/'
        + req.params.dishId);
})
.put((req,res,next) => {
   Dishes.findByIdAndUpdate(req.params.dishId, {
       $set: req.body
   }, {new: true })
   .then((dish) => { //if the dish returned correctly
        res.statusCode = 200;
        //return value as json
        res.setHeader('Content-Type', 'application/json');
        res.json(dish); //client deals with what is returned in the dish on the client side
    },  (err) => next(err))
    .catch((err) => next(err));

})
//Dangerous operation
.delete((req,res,next) => {
   Dishes.findByIdAndRemove(req.params.dishId)
   .then((resp) => {
        res.statusCode = 200;   
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);    
    }, (err) => next(err))
    .catch((err) => next(err));
});


module.exports = dishRouter;