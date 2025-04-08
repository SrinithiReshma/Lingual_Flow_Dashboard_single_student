const { MongoClient } = require('mongodb');

const url = 'mongodb://127.0.0.1:27017'; // or your MongoDB Atlas URL
const dbName = 'testApp';
let db;

const connectToDB = (callback) => {
  MongoClient.connect(url, { useUnifiedTopology: true }, (err, client) => {
    if (err) return callback(err);
    db = client.db(dbName);
    console.log('✅ Connected to MongoDB');
    callback();
  });
};

const getDB = () => db;

module.exports = { connectToDB, getDB };
