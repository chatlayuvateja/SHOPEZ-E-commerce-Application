const crypto = require('crypto');
const { ObjectId } = require('mongodb');
const { getDB } = require('../config/db');

const collectionName = 'users';

const userSchema = {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['name', 'email', 'password'],
      properties: {
        name: {
          bsonType: 'string',
          minLength: 2,
          maxLength: 50,
          description: 'Name is required',
        },
        email: {
          bsonType: 'string',
          pattern: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$',
          description: 'Must be a valid email address',
        },
        password: {
          bsonType: 'string',
          minLength: 8,
          description: 'Password is required and must be at least 8 characters',
        },
        role: {
          enum: ['USER', 'SELLER', 'ADMIN'],
          default: 'USER',
        },
        avatar: { bsonType: 'string' },
        phone: { bsonType: 'string' },
        address: {
          bsonType: 'object',
          properties: {
            street: { bsonType: 'string' },
            city: { bsonType: 'string' },
            state: { bsonType: 'string' },
            pincode: { bsonType: 'string' },
            country: { bsonType: 'string' },
          },
        },
        isActive: { bsonType: 'bool' },
        refreshToken: { bsonType: 'string' },
        passwordChangedAt: { bsonType: 'date' },
        createdAt: { bsonType: 'date' },
      },
    },
  },
};

const hashPassword = async (password) => {
  return new Promise((resolve, reject) => {
    const salt = crypto.randomBytes(16).toString('hex');
    crypto.scrypt(password, salt, 64, (err, derivedKey) => {
      if (err) reject(err);
      resolve(salt + ':' + derivedKey.toString('hex'));
    });
  });
};

const comparePassword = async (candidatePassword, hashedPassword) => {
  return new Promise((resolve, reject) => {
    const [salt, key] = hashedPassword.split(':');
    crypto.scrypt(candidatePassword, salt, 64, (err, derivedKey) => {
      if (err) reject(err);
      resolve(key === derivedKey.toString('hex'));
    });
  });
};

const User = {
  collectionName,

  async initCollection(db) {
    const collections = await db.listCollections({ name: collectionName }).toArray();
    if (collections.length === 0) {
      await db.createCollection(collectionName, userSchema);
      await db.collection(collectionName).createIndex({ email: 1 }, { unique: true });
      await db.collection(collectionName).createIndex({ role: 1 });
    }
  },

  async findById(id) {
    const db = getDB();
    return db.collection(collectionName).findOne({ _id: new ObjectId(id) });
  },

  async findOne(filter) {
    const db = getDB();
    return db.collection(collectionName).findOne(filter);
  },

  async create(userData) {
    const db = getDB();
    const hashedPw = await hashPassword(userData.password);
    const user = {
      name: userData.name,
      email: userData.email,
      password: hashedPw,
      role: userData.role || 'USER',
      avatar: '',
      phone: userData.phone || '',
      address: userData.address || {},
      isActive: true,
      refreshToken: '',
      createdAt: new Date(),
    };
    const result = await db.collection(collectionName).insertOne(user);
    return { ...user, _id: result.insertedId };
  },

  async findByIdAndUpdate(id, updateData) {
    const db = getDB();
    const update = { $set: {} };
    Object.keys(updateData).forEach((key) => {
      if (key !== '_id') {
        update.$set[key] = updateData[key];
      }
    });
    const result = await db.collection(collectionName).findOneAndUpdate(
      { _id: new ObjectId(id) },
      update,
      { returnDocument: 'after' }
    );
    return result;
  },

  async countDocuments(filter = {}) {
    const db = getDB();
    return db.collection(collectionName).countDocuments(filter);
  },

  async find(filter) {
    const db = getDB();
    return db.collection(collectionName).find(filter).toArray();
  },

  async aggregate(pipeline) {
    const db = getDB();
    return db.collection(collectionName).aggregate(pipeline).toArray();
  },

  async deleteMany(filter) {
    const db = getDB();
    return db.collection(collectionName).deleteMany(filter);
  },

  hashPassword,
  comparePassword,
};

module.exports = User;
