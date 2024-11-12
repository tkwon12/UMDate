const { MongoClient, ServerApiVersion } = require('mongodb');
const config = require('./config');

// Setting up the MongoDB client with connection URI
const uri = `mongodb+srv://${config.mongoDbUsername}:${config.mongoDbPassword}@cluster0.mbinhex.mongodb.net/?retryWrites=true&w=majority`;
const databaseAndCollection = { db: config.mongoDbName, collection: config.mongoCollection };
const client = new MongoClient(uri, { serverApi: ServerApiVersion.v1 });

// Function to insert user data
async function insertUserdata(userdata) {
    try {
        await client.connect();
        await client.db(databaseAndCollection.db).collection(databaseAndCollection.collection).insertOne(userdata);
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
}

// Function to look up a single entry by directoryid
async function lookUpOneEntry(directoryid) {
    try {
        await client.connect();
        const filter = { directoryid: directoryid };
        const result = await client.db(databaseAndCollection.db).collection(databaseAndCollection.collection).findOne(filter);
        return result;
    } finally {
        await client.close();
    }
}

// Function to find users not yet met by a specific user
async function lookUpnotMetme(directoryid) {
    try {
        await client.connect();
        const filter = { metme: { $nin: [directoryid] } };
        const cursor = client.db(databaseAndCollection.db).collection(databaseAndCollection.collection).find(filter);
        const result = await cursor.toArray();
        return result;
    } finally {
        await client.close();
    }
}

// Function to update a user's data
async function updateOne(directoryid, newValues) {
    try {
        await client.connect();
        const filter = { directoryid: directoryid };
        const update = { $set: newValues };
        const result = await client.db(databaseAndCollection.db).collection(databaseAndCollection.collection).updateOne(filter, update);
        return result.modifiedCount;
    } finally {
        await client.close();
    }
}

// Exporting the functions
module.exports = {
    insertUserdata,
    lookUpOneEntry,
    lookUpnotMetme,
    updateOne
};
