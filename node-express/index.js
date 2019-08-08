const express = require('express');
const http = require('http');
const morgan = require('morgan');
const bodyParser = require('body-parser');

const hostname = 'localhost';
const port = 3000;

const app = express();
//Dev version additional info on screen
app.use(morgan('dev'));
//Parse 
app.use(bodyParser.json());

//When a request comes in, for all the requests for '/dishes' endpoint
//this code exectuted first by default
app.all('/dishes', (req, res, next) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain'); //we send client plain text
    next(); //continue to look for specifications down below for dishes
});

app.get('/dishes', (req,res,next) => {
    res.end('Will send all the dishes to you!');
});

//Post new dish to server
app.post('/dishes', (req,res,next) => {
    //extract info from body
    res.end('Will add the dish: ' + req.body.name + 
        ' with details: ' + req.body.description);
});


app.put('/dishes', (req,res,next) => {
    //extract info from body
    res.statusCode = 403; //server understood, but operation is forbidden
    res.end('PUT operation not supported on /dishes');
});

//Dangerous operation
app.delete('/dishes', (req,res,next) => {
    res.end('Deleting all the dishes!');
});

//===

app.get('/dishes/:dishId', (req,res,next) => {
    res.end('Will send details of the dish: '
        + req.params.dishId + ' to you!');
});

//Post new dish to server
app.post('/dishes/:dishId', (req,res,next) => {
    //extract info from body
    res.statusCode = 403; //server understood, but operation is forbidden
    res.end('POST operation not supported on /dishes/' 
        + req.params.dishId);
})

//Update particular dish with info from json
app.put('/dishes/:dishId', (req,res,next) => {
    //extract info from body
    res.write('Updating the dish: ' + req.params.dishId + '\n');
    //if json contains details
    res.end('Will update the dish: ' + req.body.name + 
        ' with details: ' + req.body.description);
})

//Dangerous operation
app.delete('/dishes/:dishId', (req,res,next) => {
    res.end('Deleting dish: ' + req.params.dishId);
});


//Setup server to servehtml files from public folder
app.use(express.static(__dirname + '/public'));

app.use((req, res, next) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/html');
  res.end('<html><body><h1>This is an Express Server</h1></body></html>');

});

const server = http.createServer(app);

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});