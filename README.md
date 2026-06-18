

**ShopEZ** is a full-featured, production-grade e-commerce platform built with the MERN stack (MongoDB, Express.js, React.js, Node.js). It provides a complete online shopping experience — from browsing a comprehensive product catalog with advanced filtering and search to placing orders with a secure, multi-step checkout flow. The platform supports three distinct user roles — Customers, Sellers, and Administrators — each with tailored dashboards and capabilities.

The **customer experience** includes product discovery through category browsing, keyword search, and sorting, detailed product pages with image galleries and customer reviews, a persistent shopping cart, and a streamlined checkout process with multiple payment method options. Users can track their orders and request cancellations from their personal orders dashboard.

The **seller dashboard** empowers vendors to manage their product catalog with full CRUD operations, view incoming orders with status transition controls (Confirm → Ship → Deliver), and access real-time analytics including revenue charts, order status distribution, and performance metrics. The **admin panel** provides system-wide oversight with user management (role assignment, activation, deletion), order monitoring across all vendors, and product moderation capabilities.

---

## Features

### 🛍️ Shopper Features
- Browse products by category, search by keyword, and sort by price/rating/newest
- Product detail pages with image gallery, pricing with discount display, stock indicator
- Star ratings and verified purchase reviews with rating breakdown
- Persistent shopping cart with optimistic updates and quantity controls
- Multi-step checkout: delivery address → payment method → order review
- Payment methods: Cash on Delivery, UPI, Credit/Debit Card, Net Banking
- Order confirmation with animated success animation and copy-to-clipboard
- Personal orders dashboard with expandable details and cancellation support

### 🏪 Seller Features
- Dedicated seller dashboard with overview analytics (total products, orders, revenue, ratings)
- Revenue trend chart (last 6 months) and order status distribution donut chart
- Product management: Add, Edit, Toggle Active/Inactive, Delete with table view
- Incoming orders management with status transition dropdown (Pending → Confirmed → Shipped → Delivered)
- Pagination for products and orders tables

### 🔐 Admin Features
- Comprehensive admin dashboard with system-wide analytics
- Revenue overview chart and orders-by-status chart
- Top 5 products by revenue table
- User management: search by name/email, change user roles, toggle active status
- Typed-confirmation user deletion with cascade (removes all associated data)
- Full orders view with status filter tabs, expandable order details
- Product moderation: view all products, toggle active/inactive

---

## Tech Stack

| Layer       | Technology                                                  |
|-------------|-------------------------------------------------------------|
| **Frontend** | React.js (Create React App), React Router v6, Chart.js, pure CSS with design tokens |
| **Backend**  | Node.js, Express.js, express-validator, express-rate-limit, compression, helmet |
| **Database** | MongoDB, Mongoose ODM (with aggregations, virtuals, middleware hooks) |
| **Auth**     | JWT (access + refresh tokens in httpOnly cookies), bcryptjs, role-based access (USER / SELLER / ADMIN) |

---

## Prerequisites

- **Node.js** >= 18.x
- **npm** >= 9.x
- **MongoDB** — local instance (default) or MongoDB Atlas connection string
- **Git** for version control
- A terminal (PowerShell, bash, or zsh)

---

## Local Setup

### 1. Clone the Repository

```sh
git clone https://github.com/YOUR_USERNAME/shopez.git
cd shopez
```

### 2. Backend Setup

```sh
cd backend
npm install
cp .env.example .env
```

Edit `backend/.env` if needed. The defaults work with a local MongoDB instance.

```sh
npm run dev    # starts backend at http://localhost:5000
```

### 3. Frontend Setup

Open a second terminal:

```sh
cd frontend
npm install
cp .env.example .env
npm start      # starts frontend at http://localhost:3000
```

### 4. Seed the Database

With the backend running (or just MongoDB connected):

```sh
cd backend
npm run seed
```

This creates 6 users, 12 products, reviews, sample orders, and empty carts.

---

## Default Credentials

> ⚠️ **Change all passwords before deploying to production.**

| Role     | Email                 | Password    |
|----------|-----------------------|-------------|
| Admin    | admin@shopez.com      | Admin@123   |
| Seller 1 | seller1@shopez.com   | Seller@123  |
| Seller 2 | seller2@shopez.com   | Seller@123  |
| Customer | user@shopez.com       | User@123    |
| Customer | priya@example.com     | User@123    |
| Customer | arun@example.com      | User@123    |

---

## API Reference

| Method | Endpoint                         | Auth     | Description                     |
|--------|----------------------------------|----------|---------------------------------|
| POST   | /api/auth/register               | Public   | Register a new user             |
| POST   | /api/auth/login                  | Public   | Log in                          |
| POST   | /api/auth/logout                 | Public   | Log out (clears cookies)        |
| GET    | /api/auth/me                     | Auth     | Get current user profile        |
| PATCH  | /api/auth/update-password        | Auth     | Update password                 |
| POST   | /api/auth/refresh                | Public   | Refresh access token            |
| GET    | /api/products                    | Public   | List products (filter, sort, search, paginate) |
| GET    | /api/products/featured           | Public   | Get featured products           |
| GET    | /api/products/categories         | Public   | Get product categories with counts |
| GET    | /api/products/:slug              | Public   | Get product by slug             |
| POST   | /api/products                    | Seller   | Create a new product            |
| PATCH  | /api/products/:id                | Seller   | Update own product              |
| DELETE | /api/products/:id                | Seller   | Delete own product              |
| GET    | /api/cart                        | Auth     | Get user's cart                 |
| POST   | /api/cart                        | Auth     | Add item to cart                |
| PATCH  | /api/cart/:productId             | Auth     | Update cart item quantity       |
| DELETE | /api/cart/:productId             | Auth     | Remove item from cart           |
| DELETE | /api/cart                        | Auth     | Clear cart                      |
| POST   | /api/orders                      | Auth     | Create order from cart          |
| GET    | /api/orders/my-orders            | Auth     | Get user's orders (paginated)   |
| PATCH  | /api/orders/:id/cancel           | Auth     | Cancel own pending order        |
| GET    | /api/orders/:id                  | Auth     | Get order by ID                 |
| PATCH  | /api/orders/:id/status           | Seller   | Update order status             |
| POST   | /api/reviews                     | Auth     | Create a review                 |
| GET    | /api/reviews/product/:productId  | Public   | Get reviews for a product       |
| DELETE | /api/reviews/:id                 | Auth     | Delete own review               |
| GET    | /api/seller/stats                | Seller   | Get seller analytics            |
| GET    | /api/seller/products             | Seller   | Get seller's products           |
| GET    | /api/seller/orders               | Seller   | Get seller's orders             |
| PATCH  | /api/seller/orders/:id/status    | Seller   | Update seller order status      |
| GET    | /api/admin/stats                 | Admin    | Get system-wide analytics       |
| GET    | /api/admin/users                 | Admin    | List all users (searchable)     |
| PATCH  | /api/admin/users/:id/status      | Admin    | Toggle user active/inactive     |
| PATCH  | /api/admin/users/:id/role        | Admin    | Change user role                |
| DELETE | /api/admin/users/:id             | Admin    | Delete user with cascade        |
| GET    | /api/admin/orders                | Admin    | List all orders (filterable)    |

---

## Folder Structure

```
shopez/
├── backend/
│   ├── config/
│   │   ├── db.js                   # MongoDB connection
│   │   └── env.js                  # Environment variable loader
│   ├── controllers/
│   │   ├── auth.controller.js      # Register, login, logout, refresh
│   │   ├── admin.controller.js     # User management, system stats
│   │   ├── product.controller.js   # CRUD, search, filter, pagination
│   │   ├── review.controller.js    # CRUD reviews with rating aggregation
│   │   ├── cart.controller.js      # Cart CRUD with auto-create
│   │   ├── order.controller.js     # Create, cancel, track orders
│   │   └── seller.controller.js    # Seller analytics, product/order mgmt
│   ├── middleware/
│   │   ├── authMiddleware.js       # JWT protect, refresh, restrictTo
│   │   ├── errorMiddleware.js      # Global error handler
│   │   ├── notFound.js             # 404 handler
│   │   └── validateMiddleware.js   # express-validator rules
│   ├── models/
│   │   ├── User.js                 # User schema with bcrypt hashing
│   │   ├── Product.js              # Product schema with finalPrice virtual
│   │   ├── Review.js               # Review with compound index, avg calc
│   │   ├── Cart.js                 # Cart schema with unique user
│   │   └── Order.js                # Order with nested items, status enum
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── admin.routes.js
│   │   ├── product.routes.js
│   │   ├── review.routes.js
│   │   ├── cart.routes.js
│   │   ├── order.routes.js
│   │   ├── user.routes.js
│   │   └── seller.routes.js
│   ├── utils/
│   │   ├── AppError.js             # Custom operational error class
│   │   ├── catchAsync.js           # Async error wrapper
│   │   └── tokenUtils.js           # JWT sign/verify/ cookie helpers
│   ├── .env.example                # Environment template
│   ├── app.js                      # Express app setup (middleware stack)
│   ├── package.json
│   ├── seeder.js                   # Database seed script
│   └── server.js                   # Entry point (connectDB + listen)
├── frontend/
│   ├── public/
│   │   ├── index.html
│   │   └── favicon.ico
│   ├── src/
│   │   ├── api/
│   │   │   ├── axiosInstance.js    # Axios with cookies, 401 interceptor
│   │   │   ├── authAPI.js
│   │   │   ├── productAPI.js
│   │   │   ├── reviewAPI.js
│   │   │   ├── cartAPI.js
│   │   │   ├── orderAPI.js
│   │   │   ├── sellerAPI.js
│   │   │   └── adminAPI.js
│   │   ├── components/
│   │   │   ├── charts/             # RevenueChart, OrdersDonutChart
│   │   │   ├── common/             # AdminRoute, PrivateRoute, SellerRoute, Pagination, EmptyState, ErrorState
│   │   │   ├── layout/             # Layout, Footer, Navbar
│   │   │   ├── orders/             # OrderStatusBadge
│   │   │   ├── products/           # ProductCard, ProductCardSkeleton, ProductFilter, ReviewCard, StarRating
│   │   │   ├── ErrorBoundary.js    # React error boundary
│   │   │   └── SEOHead.js          # Dynamic meta tags
│   │   ├── context/
│   │   │   └── AuthContext.js      # Auth state, cookie hydration, login/register/logout
│   │   ├── contexts/
│   │   │   └── CartContext.js      # Global cart state, optimistic updates, debounced sync
│   │   ├── hooks/
│   │   │   ├── useAuth.js          # Auth context consumer
│   │   │   ├── useCart.js          # Cart context re-export
│   │   │   ├── useDebounce.js      # Debounced value hook
│   │   │   ├── useFetch.js         # Generic data fetching with AbortController
│   │   │   └── useLocalStorage.js  # localStorage hook with JSON serialization
│   │   ├── pages/
│   │   │   ├── admin/
│   │   │   │   └── AdminDashboardPage.js
│   │   │   ├── auth/
│   │   │   │   ├── LoginPage.js
│   │   │   │   └── RegisterPage.js
│   │   │   ├── seller/
│   │   │   │   └── SellerDashboardPage.js
│   │   │   ├── CartPage.js
│   │   │   ├── CheckoutPage.js
│   │   │   ├── HomePage.js
│   │   │   ├── MyOrdersPage.js
│   │   │   ├── NotFoundPage.js
│   │   │   ├── OrderConfirmPage.js
│   │   │   ├── ProductDetailPage.js
│   │   │   └── ProductListPage.js
│   │   ├── utils/
│   │   │   ├── errorParser.js      # Axios error → human-readable message
│   │   │   ├── formatCurrency.js   # formatINR, formatUSD with Intl
│   │   │   └── formatDate.js       # formatDate, formatDateTime, timeAgo
│   │   ├── App.js                  # Root component with routing, providers
│   │   ├── App.css                 # Component-level styles
│   │   ├── index.js                # ReactDOM entry
│   │   └── index.css               # Global styles, design tokens, keyframes
│   ├── .env.example
│   └── package.json
├── .gitignore
└── README.md
```

---

## Seeding & Data Management

```sh
# Import all seed data (destroys existing data first)
cd backend && npm run seed

# Destroy all data (with confirmation prompt)
cd backend && npm run seed:destroy
```

---


