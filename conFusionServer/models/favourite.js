const mongoose = require('mongoose');
const dishSchema = require('./dishes').schema;
const Schema = mongoose.Schema;


const favouriteSchema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    dishes: [dishSchema]
}, {
    timestamps: true
});

var Favourites = mongoose.model('Favourite', favouriteSchema);

module.exports = Favourites;