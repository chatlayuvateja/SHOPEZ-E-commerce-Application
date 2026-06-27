const { MongoClient } = require('mongodb');
const { MongoMemoryServer } = require('mongodb-memory-server');

let client = null;
let db = null;
let mongod = null;

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/shopez';
    
    try {
      client = new MongoClient(uri, { serverSelectionTimeoutMS: 3000 });
      await client.connect();
      await client.db().admin().ping();
      db = client.db();
      console.log(`MongoDB Connected: ${client.topology?.s?.host}`);
      return db;
    } catch (err) {
      console.log('Local MongoDB not available, starting in-memory MongoDB...');
      
      if (!mongod) {
        mongod = await MongoMemoryServer.create();
        const memUri = mongod.getUri();
        console.log(`MongoDB Memory Server started at: ${memUri}`);
        
        client = new MongoClient(memUri);
        await client.connect();
        db = client.db('shopez');
        console.log('In-memory MongoDB connected successfully');
        return db;
      }
    }
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

const getDB = () => {
  if (!db) {
    throw new Error('Database not initialized. Call connectDB() first.');
  }
  return db;
};

const getClient = () => client;

const closeDB = async () => {
  if (client) {
    await client.close();
    client = null;
    db = null;
  }
  if (mongod) {
    await mongod.stop();
    mongod = null;
  }
};

module.exports = { connectDB, getDB, getClient, closeDB };