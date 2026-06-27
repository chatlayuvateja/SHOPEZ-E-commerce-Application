const app = require('./app');
const { connectDB } = require('./config/db');
const seedData = require('./seedData');

const PORT = process.env.PORT || 5000;

process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION:', err.message);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION:', err.message);
  process.exit(1);
});

app.enable('trust proxy');

const autoSeed = async (db) => {
  const userCount = await db.collection('users').countDocuments();
  if (userCount === 0) {
    console.log('Database is empty. Auto-seeding...');
    await seedData(db);
    console.log('Auto-seeding complete!');
  } else {
    console.log(`Database already has ${userCount} users. Skipping seed.`);
  }
};

connectDB().then(async (db) => {
  app.locals.db = db;
  await autoSeed(db);
  app.listen(PORT, () => {
    console.log(`ShopEZ Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });
});