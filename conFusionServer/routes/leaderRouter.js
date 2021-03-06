const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const authenticate = require('../authenticate');
const Leaders = require('../models/leader');
const cors = require('./cors');

const leaderRouter = express.Router();

leaderRouter.use(bodyParser.json());

/**
 * Leader all
 */
leaderRouter.route('/')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, (req,res,next) => {
    Leaders.find(req.query) //pass parameter f.e. ?featured=true - mapped to {featured: true}
    .then((leaders) => {
        //OK operation find completed
        res.statusCode = 200;
        //return value as json
        res.setHeader('Content-Type', 'application/json');
        res.json(leaders);
    }, (err) => next(err))
    .catch((err) => next(err));
})
//Post new leader to server
.post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req,res,next) => {
    Leaders.create(req.body)
    .then((leader) => { //if the leader returned correctly
        console.log('Dish Created', leader);
        res.statusCode = 200;
        //return value as json
        res.setHeader('Content-Type', 'application/json');
        res.json(leader); //client deals with what is returned in the leader on the client side
    },  (err) => next(err))
    .catch((err) => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req,res,next) => {
    //extract info from body
    res.statusCode = 403; //server understood, but operation is forbidden
    res.end('PUT operation not supported on /leaders');
})
//Dangerous operation
.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req,res,next) => {
    Leaders.remove({})
    .then((resp) => {
         res.statusCode = 200;   
         res.setHeader('Content-Type', 'application/json');
         res.json(resp);    
    }, (err) => next(err))
    .catch((err) => next(err));
});



leaderRouter.route('/:leaderId')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, (req,res,next) => {
    Leaders.findById(req.params.leaderId)
    .then((leader) => { //if the leader returned correctly
        res.statusCode = 200;
        //return value as json
        res.setHeader('Content-Type', 'application/json');
        res.json(leader); //client deals with what is returned in the leader on the client side
    },  (err) => next(err))
    .catch((err) => next(err));
})
//Post new leader to server
.post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req,res,next) => {
    res.statusCode = 403;
    res.end('POST operation not supported on /leaders/'
        + req.params.leaderId);
})
.put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req,res,next) => {
    Leaders.findByIdAndUpdate(req.params.leaderId, {
        $set: req.body
    }, {new: true })
    .then((leader) => { //if the leader returned correctly
         res.statusCode = 200;
         //return value as json
         res.setHeader('Content-Type', 'application/json');
         res.json(leader); //client deals with what is returned in the leader on the client side
     },  (err) => next(err))
     .catch((err) => next(err));
})
//Dangerous operation
.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req,res,next) => {
    Leaders.findByIdAndRemove(req.params.leaderId)
    .then((resp) => {
         res.statusCode = 200;   
         res.setHeader('Content-Type', 'application/json');
         res.json(resp);    
     }, (err) => next(err))
     .catch((err) => next(err));
});

module.exports = leaderRouter;
