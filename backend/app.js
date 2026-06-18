const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const compression = require('compression');
const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');

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

app.use(compression());
app.use(helmet());

app.set('etag', 'strong');

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true,
}));

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  validate: { trustProxy: false },
  message: {
    status: 'fail',
    message: 'Too many requests from this IP, please try again later.',
  },
});

app.use('/api', limiter);

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
