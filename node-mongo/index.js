const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

const url = 'mongodb://localhost:27017/';
const dbname = 'conFusion';

MongoClient.connect(url, (err, client) => {
    //check error is not null
    //assert provides such things
    assert.equal(err, null);

    console.log('Connected correctly to server');

    const db = client.db(dbname);
    //try to access dishes collection within db
    const collection = db.collection('dishes');

    //next operation after insert anr done in callback function inside insertOne
    //to make sure insert was completed before deleting everything (dropCollection)
    collection.insertOne({"name": "Uthappizza", "description": "test pizza"}, (err,result) => {
        assert.equal(err, null);

        console.log('After Insert:\n');
        console.log(result.ops); //result returned - ops - how many operations successful

        //find everything in collection and convert it to array
        //it takes callback function as parameter
        //you can provide filter here f.e. name
        collection.find({}).toArray((err,docs) => {
            assert.equal(err, null);

            console.log('Found\n');
            console.log(docs);

            //remove dishes collection from db
            db.dropCollection('dishes', (err,result) => {
                assert.equal(err, null); //chceck if error is not null
                client.close(); //close connection
            });
        });
    });


});