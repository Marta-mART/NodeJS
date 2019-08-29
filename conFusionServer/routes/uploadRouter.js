const express = require('express');
const bodyParser = require('body-parser');
const authenticate = require('../authenticate');
const multer = require('multer');

//set multer - using 
//customize multer handle image uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/images'); //eror, dest folder to store imgs
    },

    filename: (req, file, cb) => {
        cb(null, file.originalname) //error, 
    }
}); //define storage engine

//file filter - which kind of filler accept to upload
const imageFileFilter = (req, file, cb) => {
    //if file doens't contains jpg... accpet file
    if(!file.originalname.match(/\.(jpg|jpeg|png|giff)$/)) {
        return cb(new Error('Your can upload only image files!'), false);
    }
    cb(null, true); //no error, file matches pattern
};

//configure multer module - what to use
const upload = multer({storage: storage, fileFilter: imageFileFilter});

const uploadRouter = express.Router();

uploadRouter.use(bodyParser.json());

uploadRouter.route('/')
.get(authenticate.verifyUser, authenticate.verifyAdmin, (req,res,next) => {
    //extract info from body
    res.statusCode = 403; //server understood, but operation is forbidden
    res.end('GET operation not supported on /imageUpload');
})
//upload taking care of errors
//imageFiile is a Key
.post(authenticate.verifyUser, authenticate.verifyAdmin, upload.single('imageFile'), (req,res) => {
    //only one which is available
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json(req.file); //post back to client - path to client to know the location
})
.put(authenticate.verifyUser, authenticate.verifyAdmin, (req,res,next) => {
    //extract info from body
    res.statusCode = 403; //server understood, but operation is forbidden
    res.end('PUT operation not supported on /dishes');
})
.delete(authenticate.verifyUser, authenticate.verifyAdmin, (req,res,next) => {
    //extract info from body
    res.statusCode = 403; //server understood, but operation is forbidden
    res.end('DELLETE operation not supported on /dishes');
})


module.exports = uploadRouter;