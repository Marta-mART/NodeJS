const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const authenticate = require('../authenticate');
const Promos = require('../models/promotions');
const cors = require('./cors');

const promotionRouter = express.Router();

promotionRouter.use(bodyParser.json());

/**
 * Promotions all
 */
promotionRouter.route('/')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, (req,res,next) => {
    Promos.find(req.query)
    .then((promos) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(promos);
    }, (err) => next(err))
    .catch((err) => next(err));
})
//Post new promotion to server
.post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req,res,next) => {
    Promos.create(req.body)
    .then((promo) => {
        console.log('Promotion created', promo);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(promo);
    }, (err) => next(err))
})
.put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req,res,next) => {
    //extract info from body
    res.statusCode = 403; //server understood, but operation is forbidden
    res.end('PUT operation not supported on /promotions');
})
//Dangerous operation
.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req,res,next) => {
    Promos.remove({})
    .then((resp) => {
        res.statusCode = 200;   
        res.setHeader('Content-Type', 'application/json');
        res.json(resp); 
    }, (err) => next(err))
    .catch((err) => next(err));
});



promotionRouter.route('/:promoId')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
//this code exectuted first by default
.get(cors.cors, (req, res, next) => {
    Promos.findById(req.params.promoId)
    .then((promo) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(promo);
    },  (err) => next(err))
    .catch((err) => next(err));
})
//Post new promotion to server
.post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req,res,next) => {
    res.statusCode = 403;
    res.end('POST operation not supported on /promotions/'
        + req.params.promoId);
})
.put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req,res,next) => {
    Promos.findByIdAndUpdate(req.params.promoId, {
        $set: req.body
    }, {new: true })
    .then((promo) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(dish);
    }, (err) => next(err))
    .catch((err) => next(err));
})
//Dangerous operation
.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin,(req,res,next) => {
    Promos.findByIdAndRemove(req.params.dishId)
    .then((resp) => {
         res.statusCode = 200;   
         res.setHeader('Content-Type', 'application/json');
         res.json(resp);    
     }, (err) => next(err))
     .catch((err) => next(err));
});

module.exports = promotionRouter;
