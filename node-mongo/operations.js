const assert = require('assert');

//db, document we want to insert, collection into which we want to insert document, callbac function - when operation completed do it
exports.insertDocument = (db, document, collection, callback) => {
    const coll = db.collection(collection);
    coll.insertOne(document, (err, result) => {
        assert.equal(err, null); //if error null then now it will quit app
        console.log("Inserted " + result.result.n +
            " documents into the collection " + collection); //result object whihc is returned will have result property - n - how many documents have been insterted
        callback(result); //provide callback with the result parameter
    });
};

//find everything in collection and convert it to array
        //it takes callback function as parameter
        //you can provide filter here f.e. name
//find several documents
exports.findDocuments = (db, collection, callback) => {
    const coll = db.collection(collection);
    //all documents in collection
    coll.find({}).toArray((err,docs) => {
        assert.equal(err,null);
        callback(docs); //found documents and send back
    });
};

exports.removeDocument = (db, document, collection, callback) => {
    const coll = db.collection(collection);
    //delete first doc that matches
    coll.deleteOne(document, (err, result) => {
        assert.equal(err, null); //error not null?
        console.log("Removed the document ", document); //, not +, becuse it is JS object
        callback(result);

    });
};

exports.updateDocument = (db, document, update, collection, callback) => {
    const coll = db.collection(collection);
    //pass fields that need to be updated
    //which fileds must be updated
    coll.updateOne(document, { $set: update }, null, (err, result) => {
        assert.equal(err, null);
        console.log("Updated the document with ", update);
        callback(result);        
    });
};
