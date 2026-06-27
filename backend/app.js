const path = require('path');
const { loadEnv } = require('./utils/env');
loadEnv(path.resolve(__dirname, '.env'));

const express = require('express');
const { corsMiddleware } = require('./utils/cors');
const { parseCookies } = require('./utils/cookies');

const notFound = require('./middleware/notFound');
const errorMiddleware = require('./middleware/errorMiddleware');

const authRoutes = require('./routes/auth.routes');
const productRoutes = require('./routes/product.routes');
const orderRoutes = require('./routes/order.routes');
const reviewRoutes = require('./routes/review.routes');
const userRoutes = require('./routes/user.routes');
const sellerRoutes = require('./routes/seller.routes');
const cartRoutes = require('./routes/cart.routes');
const adminRoutes = require('./routes/admin.routes');

const app = express();

app.set('etag', 'strong');

app.use(corsMiddleware({
  origin: process.env.CLIENT_URL,
  credentials: true,
}));

app.use(parseCookies);

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Make db accessible to routes
app.use((req, res, next) => {
  req.db = req.app.locals.db;
  next();
});

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/users', userRoutes);
app.use('/api/seller', sellerRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/admin', adminRoutes);

app.use(notFound);
app.use(errorMiddleware);

module.exports = app;
