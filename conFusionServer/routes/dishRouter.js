const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const authenticate = require('../authenticate');

const Dishes = require('../models/dishes');

const dishRouter = express.Router();

dishRouter.use(bodyParser.json());

/**
 * Dish all api
 */
dishRouter.route('/')
.get((req,res,next) => {
    Dishes.find({})
    .populate('comments.author')
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
//authenticate.verifyUser acting as a barrier for post method
.post(authenticate.verifyUser, (req,res,next) => {
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
.put(authenticate.verifyUser, (req,res,next) => {
    //extract info from body
    res.statusCode = 403; //server understood, but operation is forbidden
    res.end('PUT operation not supported on /dishes');
})
//Dangerous operation - remove all
.delete(authenticate.verifyUser, (req,res,next) => {
   Dishes.remove({})
   .then((resp) => {
        res.statusCode = 200;   
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);    
   }, (err) => next(err))
   .catch((err) => next(err));
})

/**
 * Dish id - particular dish requests
 */
dishRouter.route('/:dishId')
.get((req,res,next) => {
    Dishes.findById(req.params.dishId)
    .populate('comments.author')
    .then((dish) => { //if the dish returned correctly
        res.statusCode = 200;
        //return value as json
        res.setHeader('Content-Type', 'application/json');
        res.json(dish); //client deals with what is returned in the dish on the client side
    },  (err) => next(err))
    .catch((err) => next(err));
})
//Post new dish to server
.post(authenticate.verifyUser, (req,res,next) => {
    res.statusCode = 403;
    res.end('POST operation not supported on /dishes/'
        + req.params.dishId);
})
.put(authenticate.verifyUser, (req,res,next) => {
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
.delete(authenticate.verifyUser, (req,res,next) => {
   Dishes.findByIdAndRemove(req.params.dishId)
   .then((resp) => {
        res.statusCode = 200;   
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);    
    }, (err) => next(err))
    .catch((err) => next(err));
});









/**
 * Group of comments in particular dish
 */

dishRouter.route('/:dishId/comments')
.get((req,res,next) => {
    Dishes.findById(req.params.dishId)
    .populate('comments.author')
    .then((dish) => {
        //if dish exists
        if( dish != null) { 
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(dish.comments);
        }
        else {
            err = new Error('Dish ' + req.params.dishId + ' not found');
            err.status = 404;
            return next(err); //this will be handled by app
        }
       
    }, (err) => next(err))
    .catch((err) => next(err)); //if error returned pass error to overall error handler in app
})
//Post new comment
.post(authenticate.verifyUser, (req,res,next) => {
    Dishes.findById(req.params.dishId)
    .then((dish) => { //if the dish returned correctly
         //if dish exists
         if(dish != null) {    
             req.body.author = req.user._id;     
             //we have dish becuase find returns it
             //so we know this object will have the comments
            dish.comments.push(req.body); //body contains all comments 
            dish.save() //save updated dish
            .then((dish) => {
                Dishes.findById(dish._id)
                    .populate('comments.author') //populate authors info into comment
                    .then((dish) => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(dish); //send back updated dish (with comments) comment
                    })
                
            }, (err) => next(err));            
        }
        else {
            err = new Error('Dish ' + req.params.dishId + ' not found');
            err.status = 404;
            return next(err); //this will be handled by app
        }       
    },  (err) => next(err))
    .catch((err) => next(err));
   
})
.put(authenticate.verifyUser, (req,res,next) => {
    //extract info from body
    res.statusCode = 403; //server understood, but operation is forbidden
    res.end('PUT operation not supported on /dishes/' + req.params.dishId + '/comments');
})
//Dangerous operation
.delete(authenticate.verifyUser, (req,res,next) => {
    //dangerous operation - remove all
    Dishes.findById(req.params.dishId)
   .then((dish) => {
        if(dish != null) {          
            //remove all comments in the dish   
           for (var i = (dish.comments.length - 1); i >= 0; i--)
           {
               dish.comments.id(dish.comments[i]._id).remove();
           }
           dish.save() //save updated dish
           .then((dish) => {
               res.statusCode = 200;
               res.setHeader('Content-Type', 'application/json');
               res.json(dish.comments); //send back updated dish (with comments) comment
           }, (err) => next(err));    
        }
        else {
            err = new Error('Dish ' + req.params.dishId + ' not found');
            err.status = 404;
            return next(err); //this will be handled by app
        }     
   }, (err) => next(err))
   .catch((err) => next(err));
})





/**
 * Particular comment in particular dish
 */

dishRouter.route('/:dishId/comments/:commentId')
.get((req,res,next) => {
    Dishes.findById(req.params.dishId)
    .populate('comments.author')
    .then((dish) => { //if the dish returned correctly
         //if dish exists and comment exists
         if( dish != null && dish.comments.id(req.params.commentId) != null) { 
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(dish.comments.id(req.params.commentId));
        }
        //dish is null
        else if (dish == null) {
            err = new Error('Dish ' + req.params.dishId + ' not found');
            err.status = 404;
            return next(err); //this will be handled by app
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
//Post new dish to server
.post(authenticate.verifyUser, (req,res,next) => {
    res.statusCode = 403;
    res.end('POST operation not supported on /dishes/'
        + req.params.dishId + '/comments/' + req.params.commentId);
})
.put(authenticate.verifyUser, (req,res,next) => {
    Dishes.findById(req.params.dishId)
    .then((dish) => { //if the dish returned correctly
         //if dish exists and comment exists
         if( dish != null && dish.comments.id(req.params.commentId) != null) { 
            //update fields of the comment
            //but if author already exists, we don't want to change it
            //only easy way to update subdocuments - workaround
            if(req.body.rating) {
                dish.comments.id(req.params.commentId).rating = req.body.rating;
            }
            if (req.body.comment) {
                dish.comments.id(req.params.commentId).comment = req.body.comment;
            }
            dish.save() //save updated dish
            .then((dish) => {
                Dishes.findById(dish._id) //one more search because we need to populate comments into dish
                .populate('comments.author')
                .then((dish) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(dish.comments); //send back updated dish (with comments) comment
                })
                
            }, (err) => next(err));       
        }
        //dish is null
        else if (dish == null) {
            err = new Error('Dish ' + req.params.dishId + ' not found');
            err.status = 404;
            return next(err); //this will be handled by app
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
.delete(authenticate.verifyUser, (req,res,next) => {
    //find the dish
    Dishes.findById(req.params.dishId)
    .then((dish) => {
        //if dish and comment within it exist
        if( dish != null && dish.comments.id(req.params.commentId) != null)  {          
             //remove specific comment
             dish.comments.id(req.params.commentId).remove();

            dish.save() //save updated dish
            .then((dish) => {
                Dishes.findById(dish._id)
                    .populate('comments.author') //populate authors info into comment
                    .then((dish) => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(dish); //send back updated dish (with comments) comment
                    })
            }, (err) => next(err));    
         }
         //dish is null
         else if (dish == null) {
            err = new Error('Dish ' + req.params.dishId + ' not found');
            err.status = 404;
            return next(err); //this will be handled by app
        } 
        //comment is nul l
        else {
            err = new Error('Comment ' + req.params.commentId + ' not found');
            err.status = 404;
            return next(err); //this will be handled by app
        }  
    }, (err) => next(err))
});

module.exports = dishRouter;