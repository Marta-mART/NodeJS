const assert = require('assert');

//db, document we want to insert, collection into which we want to insert document, callbac function - when operation completed do it
exports.insertDocument = (db, document, collection, callback) => {
    const coll = db.collection(collection);
    return coll.insertOne(document);
};

//find everything in collection and convert it to array
        //it takes callback function as parameter
        //you can provide filter here f.e. name
//find several documents
exports.findDocuments = (db, collection, callback) => {
    const coll = db.collection(collection);
    //all documents in collection
    return coll.find({}).toArray();
};

exports.removeDocument = (db, document, collection, callback) => {
    const coll = db.collection(collection);
    //delete first doc that matches
    return coll.deleteOne(document);
};

exports.updateDocument = (db, document, update, collection, callback) => {
    const coll = db.collection(collection);
    //pass fields that need to be updated
    //which fileds must be updated
    //return promise 
    return coll.updateOne(document, { $set: update }, null);
};
