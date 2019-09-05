const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const authenticate = require('../authenticate');
const cors = require('./cors');

const Comments = require('../models/comments');

const commentRouter = express.Router();

commentRouter.use(bodyParser.json());

/**
 * Dish all api
 */
commentRouter.route('/')



/**
 * Group of comments in particular comments
 */

commentRouter.route('/')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, (req,res,next) => {
    Comments.findById(req.query)
    .populate('author')
    .then((comments) => {
        //if comments exists       
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(comments);        
        
    }, (err) => next(err))
    .catch((err) => next(err)); //if error returned pass error to overall error handler in app
})
//Post new comment
.post(cors.corsWithOptions, authenticate.verifyUser, (req,res,next) => {
   //comment enclosed in body
    if(req.body != null) {
        req.body.author = req.user._id;

        Comments.create(req.body)
        .then((comments) => { //if the comments returned correctly
            Comments.findById(comments._id)
            .populate('author')
            .then((comment) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(comment);  
            })
        },  (err) => next(err))
        .catch((err) => next(err));
    }
    else {
        err = new Error('Comment not found in request body');
        err.status = 404;
        return next(err);
    }     
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req,res,next) => {
    //extract info from body
    res.statusCode = 403; //server understood, but operation is forbidden
    res.end('PUT operation not supported on /comments/');
})
//Dangerous operation
.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req,res,next) => {
    //dangerous operation - remove all
    Comments.remove({})
   .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
   }, (err) => next(err))
   .catch((err) => next(err));
})



/**
 * Particular comment in particular comments
 */

commentRouter.route('/:commentId')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, (req,res,next) => {
    Comments.findById(req.params.commentId)
    .populate('author')
    .then((comment) => { //if the comments returned correctly
         //if comments exists and comment exists
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(comment);     
        
    },  (err) => next(err))
    .catch((err) => next(err));
})
//Post new comments to server
.post(cors.corsWithOptions, authenticate.verifyUser, (req,res,next) => {
    res.statusCode = 403;
    res.end('POST operation not supported on /comments/' + req.params.commentId);
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req,res,next) => {
    Comments.findById(req.params.commentId)
    .then((comments) => { //if the comments returned correctly
         //if comments exists and comment exists
         if(comment != null) { 
            //are you author of comment? no
            if(!comment.author.equals(req.user._id)) {            
                err = new Error('This is not your comment. You cannot change it!');
                err.status = 403;
                return next(err);                 
            }
            req.body.author = req.user._id;
            
            Comments.findByIdAndUpdate(req.params.commentId, {
                $set: req.body
            }, { new: true })
            .then((comment) => {
                Comments.findById(comment._id) //one more search because we need to populate comments into comments
                .populate('comments.author')
                .then((comment) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(comment); //send back updated comments (with comments) comment
                })
            },  (err) => next(err))
        }        
        //comment is null
        else {
            err = new Error('Comment ' + req.params.commentId + ' not found');
            err.status = 404;
            return next(err); //this will be handled by app
        }
    },  (err) => next(err))
    .catch((err) => next(err));
})
//Dangerous operation
.delete(cors.corsWithOptions, authenticate.verifyUser, (req,res,next) => {
    //find the comments
    Comments.findById(req.params.commentId)
    .then((comment) => {
        //if comments and comment within it exist
        if( comment != null)  {        
            if(!comment.author.equals(req.user._id)) { 

                err = new Error('This is not your comment. You cannot delete it!');
                err.status = 403;
                return next(err); //this will be handled by app
            }

            //remove specific comment
            Comments.findByIdAndRemove(req.params.commentId)
            .then((resp) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(comments); 
            }, (err) => next(err))
            .catch((err) => next(err));        
            
         }         
        //comment is null
        else {
            err = new Error('Comment ' + req.params.commentId + ' not found');
            err.status = 404;
            return next(err); //this will be handled by app
        }  
    }, (err) => next(err))
});

module.exports = commentRouter;