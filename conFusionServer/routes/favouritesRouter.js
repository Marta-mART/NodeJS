const express = require('express');
const bodyParser = require('body-parser');
const authenticate = require('../authenticate');
const Favourites = require('../models/favourite');
const Dishes = require('../models/dishes');
const Users = require('../models/user');
const cors = require('./cors');

const favouriteRouter = express.Router();

favouriteRouter.use(bodyParser.json());

favouriteRouter.route('/')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
//all dishes of exact user
.get(cors.corsWithOptions, authenticate.verifyUser, (req,res,next) => {
   
   Favourites.findOne({user: req.user._id})
   .populate('user')
   .then((favourite) => { //favourite doc returned correctly
      console.log('Favourite: ', favourite);
      if(favourite != null) { //if document is not null, if list exist
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(favourite);
      }
      else{
         err = new Error('Favourite list not found');
         err.status = 404;
         return next(err); //this will be handled by app
      }
   }, (err) => next(err))
   .catch((err) => next(err));
})
/**
 * {
 * {"_id": "232432232"},
 * {"_id": "232432342"}
 */
.post(cors.corsWithOptions, authenticate.verifyUser, (req,res,next) => {
    //add a specific dish to list of favourites gets dish id  like with comment

    Favourites.findOne({user: req.user._id})
    .then((favourite) => { //favourite doc returned correctly
      if(favourite) {

         //Async function, to all async operations in for loop execute earlier before save
         async function run() {
            console.log('Start for');

            //Comparising dishes in body
            for(var i  = (req.body.length - 1); i >= 0; i--) 
            {
               console.log('In for loop');

               //With dishes on favourite list
                  if(favourite.dishes.findIndex(x => x._id == req.body[i]._id) === -1)
                  {
                     console.log('Dish is not on the list'); 

                     //If dish is not on the favourite list, add it
                     await Dishes.findById(req.body[i]._id)
                     .then((dish) => {         
                        if(dish) {                           
                           favourite.dishes.push(dish);    
                        }  
                        else{
                           err = new Error('Dish ' + req.params.dishId + ' not found');
                           err.status = 404;
                           return next(err); //this will be handled by app
                        }
                                     
                     }, (err) => next(err))
                     .catch((err) => next(err));
      
                     //alternative of dish?   favourite.dishes.push(favourite.dishes.id(favourite.dishes[i]._id));       
      
                  }
                  // If dish is already on the list, do nothing
                  else{
                     console.log('Dish ' + req.body[i]._id + ' already exists');
                  }
            
              
            }//end for 

            //Save dishes added to favourite list and populate user
            console.log('Start save');
            await favourite.save()
            .then((favourite) => {
                      
               favourite
               .populate('user')               
               
               res.statusCode = 201;
               res.setHeader('Content-Type', 'application/json');
               res.json(favourite);
                           
            });
            console.log('End save');

         }
         run().catch(err => console.error(err.stack));        
      }
      //If favourite list does not exist
      else {

         async function run() {
            console.log('1 Favourite doc of this user not found');

            //Two arrays - first add all dishes from the body, even with duplicates
            var myFirstDishesOnList = []; 
            //Create array from array above, but filter duplicates
            var uniqueArray = [];

            for(var i  = (req.body.length - 1); i >= 0; i--) 
            {
               console.log('id: ' + (req.body[i]._id));

               await Dishes.findById(req.body[i]._id)
               .then((dish) => {

                  if(dish)   myFirstDishesOnList.push(dish);
                  //if dish is null - it doens't matter where we push dish - in which array
                  else {
                     err = new Error('Dish ' + req.params.dishId + ' not found');
                     err.status = 404;
                     return next(err);
                  }

               })
               .then((dish) => {
                  //if operation is without async await, then this array is out this scope undefined, because it will
                  //be earlier empty in creation line: await Favourites.create({"user": req.user._id, "dishes": uniqueArray})
                  
                  //creating array with non duplicates on id
                  uniqueArray = [...new Set(myFirstDishesOnList.map(itm => JSON.stringify(itm)))].map(i => JSON.parse(i));
               });
            }


            //Create new favourite list from unique Array of dishes to be added
            await Favourites.create({"user": req.user._id, "dishes": uniqueArray})
            .then((favourite) => {
               console.log("Save");
               favourite.save()
               favourite.populate('user')
               .then((resp) => {
                  res.statusCode = 200;
                  res.setHeader('Content-Type', 'application/json');
                  res.json(resp); //send back updated dish (with comments) comment
               }, (err) => next(err)); 
            });
         }

         run().catch(err => console.error(err.stack));    


      }
   });
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
   res.statusCode = 403;
   res.end('PUT operation not supported on /favorites');
})
//favourite doc completely deleted
.delete(cors.corsWithOptions, authenticate.verifyUser, (req,res,next) => {

   //Remove the whole favourite list of specific user
   Favourites.findOneAndRemove({user: req.user._id})
    .then((resp) => { //favourite doc returned correctly
     
         res.statusCode = 200;   
         res.setHeader('Content-Type', 'application/json');
         res.json(resp); //this will be handled by app
        
}, (err) => next(err))
.catch((err) => next(err));

});



/**
 * Route on favourite/dishId 
 * operation on specific dish on favourite list
 */

favouriteRouter.route('/:dishId')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
//chceck, if dish is already on the list - indexOf method
//particular dish added
.get(cors.corsWithOptions, authenticate.verifyUser, (req,res,next) => {
   res.statusCode = 403;
   res.end('GET operation not supported on /favorites/'+ req.params.dishId);
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req,res,next) => {
 
    Favourites.findOne({user: req.user._id})
    .then((favourite) => { //favourite doc returned correctly
      if(favourite) { //if favourite document of user found successfully
         
         //if dish is on the list - check if index is not -1
         console.log(favourite.dishes.findIndex(x => x._id === req.params.dishId));

         //It compares _id field in dishes with dishId - type is different, so use == instead of ===
          if(favourite.dishes.findIndex(x => x._id == req.params.dishId) !== -1) {
            err = new Error('Dish ' + req.params.dishId + ' exists on the favourite list');
            err.status = 409; //confict, resource exists
            return next(err);
          }
          else {
            console.log('Dish does not exist on the list');
           
             //add dish from dishId, if it makes sense - its id exists
             Dishes.findById(req.params.dishId)
             .then((dish) => {

                favourite.dishes.push(dish);
                favourite.user = req.user._id;

                //Save added dish with favourite list
                favourite.save()
                .then((favourite) => {
                   console.log(favourite.dish + " saved to fav list.");
                   favourite
                   .populate('user') //I dont't understand, why we don't populate dishes, but this way it works               
                   
                   res.statusCode = 201;
                   res.setHeader('Content-Type', 'application/json');
                   res.json(favourite);
                  
                })

              }, (err) => next(err))
             .catch((err) => next(err));
          }
         
       }//end favourite exist

       //document of this user not found successfully, user doesn't have fav list 
       else { 
         console.log('1 Favourite doc of this user not found');
          
          Dishes.findById(req.params.dishId)
             .then((dish) => {
                //if dish is found       
                if(dish != null) {  
                  console.log('2 Such dish exists ', dish);

                  //Create new favourite list with found dish
                  Favourites.create({"user": req.user._id, "dishes": [dish]})
                  .then((favourite) => {
                     favourite.save()
                     .then((favourite) => {
                        favourite.populate('user')
                        
                        console.log('3 Fav list created', favourite);
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(favourite);                        
                     })
                     
                  }, (err) => next(err))
               }
               //if dish is null
               else {
                  err = new Error('Dish ' + req.params.dishId + ' not found');
                  err.status = 404;
                  return next(err); //this will be handled by app
               }
            },  (err) => next(err))
            .catch((err) => next(err));

            
       }//else end
    })
    .catch((err) => next(err)); //favourite doc not found (not possible, because the search is by user id)
    
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
   res.statusCode = 403;
   res.end('PUT operation not supported on /favorites/'+ req.params.dishId);
})
//specific dish deleted
.delete(cors.corsWithOptions, authenticate.verifyUser, (req,res,next) => {

   //Find list of specific user
   Favourites.findOne({user: req.user._id})
   .then((favourite) => {
   
      //Remove specific dish from favourite list - remember it may end up empty - it is not a problem for us
      favourite.dishes.id(req.params.dishId).remove();
      favourite.save()
      .then((resp) => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(resp); 
      });


   }, (err) => next(err))
   .catch((err) => next(err));

});

module.exports = favouriteRouter;
