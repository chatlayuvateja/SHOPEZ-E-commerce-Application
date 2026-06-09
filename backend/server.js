const app = require('./app');
const connectDB = require('./config/db');

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

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`ShopEZ Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  });
});
