const express = require('express');
const cors = require('cors');
const app = express();

//all origns server accept
const whitelist = ['http://localhost:3000', 'https://localhost:3443', 'http://Lenovo:3001'];
var corsOptionsDelegate = (req,callback) => {
    var corsOptions;

    //if header contains origin field, then look for it in whitelist
    //if it is present it won't be -1
    if(whitelist.indexOf(req.header('Origin')) !== -1) {
        corsOptions = { origin: true }; //include origin in header with access key, client side - it's ok to accept from this origin
    }
    else { //origin not in the whitelist
        corsOptions = { origin: false };
    }
    callback(null, corsOptions); 
};

//without any options - * - it is ok in get operations, standard
exports.cors = cors();
//cors with options to specific route
exports.corsWithOptions = cors(corsOptionsDelegate);