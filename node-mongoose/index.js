const mongoose = require('mongoose');

const Dishes = require('./models/dishes');

const url = 'mongodb://localhost:27017/conFusion';
const connect = mongoose.connect(url);

connect.then((db) => {
    console.log("Connected correctly to server");

    Dishes.create({
        name: 'Uthappizza',
        description: 'test'
    })
    .then((dish) => {
        console.log(dish);
        
        //exec return promise and ensures evth is ok

        //modyfing the dish we have just inserted
        //by updating description

        //flag new: true, when update complite, 
        //it returnes updated dish back to us
        return Dishes.findByIdAndUpdate(dish._id, {
            $set: {description: 'Updated test'}
        }, { 
            new: true
        }).exec();
    })
    .then((dish) => {
        console.log(dish);

        dish.comments.push({
            rating: 5,
            comment: 'I love it',
            author: 'Martin'
        });

        return dish.save();

    })
    .then((dish) => {

        console.log(dish);
        //empty JS object - removes evth
        return Dishes.remove({});
    })
    .then(() => {
        return mongoose.connection.close();
    })
    .catch((err) => {
        console.log(err);
    });
});