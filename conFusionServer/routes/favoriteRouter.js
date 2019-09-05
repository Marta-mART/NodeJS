const express = require('express');
const bodyParser = require('body-parser');
const authenticate = require('../authenticate');
const Favorites = require('../models/favorite');
const Dishes = require('../models/dishes');
const Users = require('../models/user');
const cors = require('./cors');

const favoriteRouter = express.Router();
favoriteRouter.use(bodyParser.json());

favoriteRouter.route('/')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
//all dishes of exact user
.get(cors.corsWithOptions, authenticate.verifyUser, (req,res,next) => {
   
   Favorites.findOne({user: req.user._id})
   .populate('user')
   .populate('dishes')
   .exec((err, favorites) => {
      if(err) return next(err);
      res.statusCode = 200;
      res.json(favorites);
   });
})
/**
 * {
 * {"_id": "232432232"},
 * {"_id": "232432342"}
 */
.post(cors.corsWithOptions, authenticate.verifyUser, (req,res,next) => {
    //add a specific dish to list of favourites gets dish id  like with comment

    Favorites.findOne({user: req.user._id}, (err, favorite) => {
      if(err) return next(err);

      if(!favorite) {
         Favorites.create({ user: req.user._id, })
         .then((favorite) => {
            for(i=0; i<req.body.length; i++)
               if(favorite.dishes.indexOf(req.body[i]._id) === -1)
                  favorite.dishes.push(req.body[i]);

            favorite.save()
            .then((favorite) => {
               Favorites.findById(favorite._id)
               .populate('user')
               .populate('dishes')
               .then((favorite) => {
                  res.statusCode = 200;
                  res.setHeader('Content-Type', 'application/json');
                  res.json(favorite); 
               });
            })
            .catch((err) => {
               return next(err);
            });
         })
         .catch((err) => {
            return next(err);
         })
      }
      else {
         for(i=0; i<req.body.length; i++)
               if(favorite.dishes.indexOf(req.body[i]._id) === -1)
                  favorite.dishes.push(req.body[i]);

         favorite.save()
         .then((favorite) => {
            Favorites.findById(favorite._id)
               .populate('user')
               .populate('dishes')
               .then((favorite) => {
                  res.statusCode = 200;
                  res.setHeader('Content-Type', 'application/json');
                  res.json(favorite); 
               });
         })
         .catch((err) => {
            return next(err);
         });
      }
    });
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
   res.statusCode = 403;
   res.setHeader('Content-Type', 'text/plain');
   res.end('PUT operation not supported on /favorites');
})
//favorite doc completely deleted
.delete(cors.corsWithOptions, authenticate.verifyUser, (req,res,next) => {

   //Remove the whole favorite list of specific user
   Favorites.findOneAndRemove({user: req.user._id}, (err, favorite) => {
      if(err) return next(err);

      res.statusCode = 200;   
      res.setHeader('Content-Type', 'application/json');
      res.json(favorite); 
   });   
});



/**
 * Route on favorite/dishId 
 * operation on specific dish on favorite list
 */

favoriteRouter.route('/:dishId')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
//chceck, if dish is already on the list - indexOf method
//particular dish added
.get(cors.corsWithOptions, authenticate.verifyUser, (req,res,next) => {
   Favourites.findOne({user: req.user._id})
   .then((favourites) => {
      if(!favourites) {
         res.statusCode = 200;
         res.setHeader('Content-Type', 'application/json');
         return res.json({"exists": false, "favourites": favourites});
      }
      else {
         if(favourites.dishes.indexOf(req.params.dishId) < 0) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            return res.json({"exists": false, "favourites": favourites});
         }
         else {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            return res.json({"exists": true, "favourites": favourites});
         }
      }
   }, (err) => next (err))
   .catch((err) => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req,res,next) => {
 
   Favorites.findOne({user: req.user._id}, (err, favorite) => {
      if(err) return next(err);

      if(!favorite) {
         Favorites.create({ user: req.user._id })
         .then((favorite) => {
            favorite.dishes.push({ "_id": req.params.dishes});
            favorite.save()
            .then((favorite) => {
               Favorites.findById(favorite._id)
               .populate('user')
               .populate('dishes')
               .then((favorite) => {
                  res.statusCode = 200;
                  res.setHeader('Content-Type', 'application/json');
                  res.json(favorite); 
               });
            })
            .catch((err) => { return next(err); });
         })
         .catch((err) => {
            return next(err);
         })
      }
      else {
         if(favorite.dishes.indexOf(req.params.dishId) === -1 ) {
            favorite.dishes.push({ "_id": req.params.dishId});
            favorite.save()
            .then((favorite) => {
               Favorites.findById(favorite._id)
               .populate('user')
               .populate('dishes')
               .then((favorite) => {
                  res.statusCode = 200;
                  res.setHeader('Content-Type', 'application/json');
                  res.json(favorite); 
               });
               
            })
            .catch((err) => { return next(err); });
         }
         else {
            res.statusCode = 403;
            res.setHeader('Content-Type', 'text/plain');
            res.end('Dish ' + req.params.dishId + ' already exists on list'); 
         }
           
      }
   });
  
    
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
   res.statusCode = 403;
   res.setHeader('Content-Type', 'text/plain');
   res.end('PUT operation not supported on /favorites/'+ req.params.dishId);
})
//specific dish deleted
.delete(cors.corsWithOptions, authenticate.verifyUser, (req,res,next) => {

   //Find list of specific user
   Favorites.findOne({user: req.user._id}, (err, favorite) => {
      if(err) return next(err);

      var index = favorite.dishes.indexOf(req.params.dishId);
      if(index >= 0) {
         favorite.dishes.splice(index,1);
         favorite.save()
         .then((favorite) => {
            Favorites.findById(favorite._id)
            .populate('user')
            .populate('dishes')
            .then((favorite) => {
               res.statusCode = 200;
               res.setHeader('Content-Type', 'application/json');
               res.json(favorite); 
            });
         })
         .catch((err) => { return next(err); });
      }
       else {
            res.statusCode = 404;
            res.setHeader('Content-Type', 'text/plain');
            res.end('Dish ' + req.params.dishId + ' not in your favorite list'); 
      
      }
   });
   

});

module.exports = favoriteRouter;
