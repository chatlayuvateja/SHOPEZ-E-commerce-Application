# ShopEZ — Complete Setup Manual

## Table of Contents

1. [Introduction](#1-introduction)
2. [System Requirements](#2-system-requirements)
3. [Software Installation Guide](#3-software-installation-guide)
   - [3.1 Installing Node.js](#31-installing-nodejs)
   - [3.2 Installing MongoDB](#32-installing-mongodb)
   - [3.3 Installing Git](#33-installing-git)
   - [3.4 Verifying the Installations](#34-verifying-the-installations)
4. [Downloading the Project](#4-downloading-the-project)
   - [4.1 Cloning from GitHub](#41-cloning-from-github)
   - [4.2 Exploring the Project Structure](#42-exploring-the-project-structure)
5. [Backend Setup — Step by Step](#5-backend-setup--step-by-step)
   - [5.1 Navigating to the Backend Directory](#51-navigating-to-the-backend-directory)
   - [5.2 Installing Backend Dependencies](#52-installing-backend-dependencies)
   - [5.3 Understanding the Environment File](#53-understanding-the-environment-file)
   - [5.4 Creating the .env File](#54-creating-the-env-file)
   - [5.5 Verifying MongoDB is Running](#55-verifying-mongodb-is-running)
   - [5.6 Starting the Backend Server](#56-starting-the-backend-server)
6. [Frontend Setup — Step by Step](#6-frontend-setup--step-by-step)
   - [6.1 Navigating to the Frontend Directory](#61-navigating-to-the-frontend-directory)
   - [6.2 Installing Frontend Dependencies](#62-installing-frontend-dependencies)
   - [6.3 Creating the Frontend .env File](#63-creating-the-frontend-env-file)
   - [6.4 Understanding the Frontend Proxy Configuration](#64-understanding-the-frontend-proxy-configuration)
   - [6.5 Starting the Frontend Development Server](#65-starting-the-frontend-development-server)
7. [Database Seeding — Filling the Application with Data](#7-database-seeding--filling-the-application-with-data)
   - [7.1 What is Seeding?](#71-what-is-seeding)
   - [7.2 Running the Seeder](#72-running-the-seeder)
   - [7.3 Understanding the Seed Data](#73-understanding-the-seed-data)
    - [7.4 Destroying All Data](#74-destroying-all-data)
    - [7.5 Product Images Seeding](#75-product-images-seeding)
8. [First-Time Login & Navigation Walkthrough](#8-first-time-login--navigation-walkthrough)
   - [8.1 Opening the Application](#81-opening-the-application)
   - [8.2 Logging in as a Customer](#82-logging-in-as-a-customer)
   - [8.3 Logging in as a Seller](#83-logging-in-as-a-seller)
   - [8.4 Logging in as an Administrator](#84-logging-in-as-an-administrator)
9. [User Roles Explained](#9-user-roles-explained)
   - [9.1 Customer (USER) Role](#91-customer-user-role)
   - [9.2 Seller (SELLER) Role](#92-seller-seller-role)
   - [9.3 Administrator (ADMIN) Role](#93-administrator-admin-role)
10. [Common Issues & Troubleshooting](#10-common-issues--troubleshooting)
    - [10.1 MongoDB Connection Refused](#101-mongodb-connection-refused)
    - [10.2 Port Already in Use](#102-port-already-in-use)
    - [10.3 npm Installation Fails](#103-npm-installation-fails)
    - [10.4 CORS Errors in Browser](#104-cors-errors-in-browser)
    - [10.5 Blank Page or Build Errors](#105-blank-page-or-build-errors)
    - [10.6 Authentication Fails / Cannot Log In](#106-authentication-fails--cannot-log-in)
    - [10.7 Database Seeding Fails](#107-database-seeding-fails)
    - [10.8 Cookie Not Set / Not Sent](#108-cookie-not-set--not-sent)
11. [Application Architecture Overview](#11-application-architecture-overview)
    - [11.1 Backend Architecture](#111-backend-architecture)
    - [11.2 Frontend Architecture](#112-frontend-architecture)
    - [11.3 Data Flow Diagram](#113-data-flow-diagram)
12. [Production Deployment Checklist](#12-production-deployment-checklist)
13. [Appendix A: Complete Default Credentials](#13-appendix-a-complete-default-credentials)
14. [Appendix B: Complete API Endpoint Reference](#14-appendix-b-complete-api-endpoint-reference)

---

## 1. Introduction

ShopEZ is a **production-grade e-commerce platform** built using only core web technologies:

- **M**ongoDB — document database for storing users, products, orders, reviews, and carts
- **E**xpress.js — web framework for Node.js that handles HTTP requests and API routing
- **R**eact.js — frontend library for building interactive user interfaces
- **N**ode.js — JavaScript runtime that runs the backend server

**Zero external dependencies for critical functionality.** The project uses custom-built implementations for all non-trivial operations:
- **Custom JWT** (`utils/jwt.js`) — token signing, verification, and cookie management using Node.js built-in `crypto` module (no `jsonwebtoken` package)
- **Custom password hashing** (`models/User.js`) — using Node.js built-in `crypto.scrypt` (no `bcryptjs` package)
- **Custom CORS** (`utils/cors.js`) — cross-origin request handling (no `cors` package)
- **Custom cookie parsing** (`utils/cookies.js`) — HTTP cookie parsing (no `cookie-parser` package)
- **Custom input validation** (`utils/validate.js`) — request body validation (no `express-validator` package)
- **Custom env loading** (`utils/env.js`) — environment variable loading (no `dotenv` package)
- **Raw MongoDB driver** — all database operations use the official `mongodb` driver directly (no Mongoose ORM)

The platform supports three types of users:
- **Customers** who can browse products, add items to a cart, place orders, and write reviews
- **Sellers** who can list products, manage inventory, and process incoming orders
- **Administrators** who have full system oversight including user management and content moderation

This manual will guide you through every step of setting up the application on your local machine, from installing the required software to logging in for the first time and navigating through the different user interfaces.

---

## 2. System Requirements

Before you begin, ensure your computer meets the following minimum requirements:

| Component     | Minimum Requirement                    | Recommended                          |
|---------------|----------------------------------------|--------------------------------------|
| Operating System | Windows 10/11, macOS 11+, or Linux (Ubuntu 20.04+) | Same                      |
| Processor     | Dual-core 2.0 GHz                      | Quad-core 2.5 GHz or faster          |
| RAM           | 4 GB                                   | 8 GB or more                         |
| Storage       | 2 GB of free disk space                | 5 GB or more                         |
| Internet      | Broadband connection required          | Same                                 |

**Software that must be installed on your computer:**

1. **Node.js** (version 18.x or higher) — the JavaScript runtime
2. **npm** (version 9.x or higher) — the Node.js package manager (comes with Node.js)
3. **MongoDB** (version 6.x or higher) — the database server
4. **Git** (optional, for cloning the repository) — version control system
5. **A modern web browser** — Google Chrome, Mozilla Firefox, or Microsoft Edge

---

## 3. Software Installation Guide

This section provides detailed, platform-specific instructions for installing each required piece of software.

### 3.1 Installing Node.js

Node.js is the runtime environment that executes JavaScript code on the server. It also includes npm, the package manager used to install project dependencies.

**On Windows:**

1. Open your web browser and go to https://nodejs.org
2. You will see two download options:
   - **LTS (Long Term Support)** — Recommended for most users. This version is stable and well-tested.
   - **Current** — Contains the latest features but may be less stable.
3. Click the **LTS** button to download the Windows installer (.msi file).
4. Once downloaded, locate the file (usually in your Downloads folder) and **double-click** it to run the installer.
5. The Node.js Setup Wizard will open. Click **Next**.
6. Read the license agreement, check "I accept the terms in the License Agreement", and click **Next**.
7. Choose the destination folder (the default `C:\Program Files\nodejs\` is fine) and click **Next**.
8. In the "Custom Setup" screen, leave all features selected and click **Next**.
9. **Important:** In the "Tools for Native Modules" screen, **check** the box that says "Automatically install the necessary tools". This will install additional build tools that some npm packages may need.
10. Click **Next**, then **Install**.
11. If Windows prompts you for permission, click **Yes**.
12. Once the installation completes, click **Finish**.
13. **Restart your computer** to ensure all environment variables are properly set.

**On macOS:**

1. Open your web browser and go to https://nodejs.org
2. Click the **LTS** button to download the macOS installer (.pkg file).
3. Once downloaded, open the .pkg file.
4. The Node.js Installer will guide you through the process:
   - Click **Continue** on the welcome screen.
   - Read the license and click **Continue**, then **Agree**.
   - Click **Install** (you may need to enter your system password).
5. The installer will copy Node.js and npm to `/usr/local/bin/`.
6. Click **Close** when the installation is complete.

**On Linux (Ubuntu/Debian):**

Open a terminal and run the following commands:

```bash
# Update package list
sudo apt update

# Install curl if not already installed
sudo apt install -y curl

# Download and import the NodeSource setup script for Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

# Install Node.js (npm is included)
sudo apt install -y nodejs

# Verify installation
node --version
npm --version
```

### 3.2 Installing MongoDB

MongoDB is the database where all application data (users, products, orders, reviews, carts) is stored.

**On Windows:**

1. Go to https://www.mongodb.com/try/download/community
2. Select the following options:
   - **Version:** 7.0 or later (latest stable)
   - **Platform:** Windows
   - **Package:** msi
3. Click **Download**.
4. Once downloaded, run the installer (.msi file).
5. In the Setup Wizard:
   - Click **Next** on the welcome screen.
   - Check "I accept the terms in the License Agreement" and click **Next**.
   - Choose **Complete** setup type (this installs all MongoDB components).
   - Click **Next**.
   - **Important:** On the "Service Configuration" screen:
     - Select **"Install MongoD as a Service"**
     - Set the service name to `MongoDB`
     - Leave "Run the service as Network Service user" selected
     - Click **Next**.
   - **Important:** On the "Install MongoDB Compass" screen, you can optionally uncheck this option if you want a faster installation. MongoDB Compass is a GUI tool for viewing your database, which can be useful for debugging.
   - Click **Install**.
6. Once the installation finishes, click **Finish**.
7. After installation, MongoDB will automatically start as a Windows service. You can verify this by:
   - Press `Windows + R`, type `services.msc`, and press Enter.
   - Scroll down to find **MongoDB Server (MongoDB)** — its status should show **"Running"**.
   - To start/stop/restart MongoDB, right-click on this service and select the appropriate option.

**On macOS:**

**Method 1: Using Homebrew (Recommended)**

```bash
# Install Homebrew if you don't have it:
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Tap the MongoDB Homebrew tap
brew tap mongodb/brew

# Install MongoDB Community Edition
brew install mongodb-community@7.0

# Start MongoDB as a macOS service (starts automatically on login)
brew services start mongodb-community@7.0
```

**Method 2: Manual Download**

1. Go to https://www.mongodb.com/try/download/community
2. Select **macOS** as the platform and download the .tgz file.
3. Extract the archive and follow the manual setup instructions on the MongoDB documentation.

**On Linux (Ubuntu/Debian):**

```bash
# Import the MongoDB public GPG key
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | sudo gpg --dearmor -o /usr/share/keyrings/mongodb-server-7.0.gpg

# Add the MongoDB repository
echo "deb [ signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# Update package list and install MongoDB
sudo apt update
sudo apt install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod

# Enable MongoDB to start automatically on boot
sudo systemctl enable mongod

# Verify MongoDB is running
sudo systemctl status mongod
```

### 3.3 Installing Git

Git is used to download (clone) the project repository and track changes. It is optional but recommended.

**On Windows:**

1. Go to https://git-scm.com/download/win
2. The download should start automatically. If not, click the download link.
3. Run the installer (.exe file).
4. In the Setup Wizard:
   - Click **Next** through the license screen.
   - Choose the installation path (default is fine).
   - In the "Select Components" screen, leave all defaults checked.
   - **Important:** In the "Choosing the default editor" screen, select an appropriate editor (Notepad++ or Visual Studio Code are good choices).
   - In the "Adjusting your PATH environment" screen, select **"Git from the command line and also from 3rd-party software"** (this is the recommended option).
   - In the "Choosing the SSH executable" screen, select **"Use bundled OpenSSH"**.
   - In the "Configuring the line ending conversions" screen, select **"Checkout Windows-style, commit Unix-style line endings"** (this ensures cross-platform compatibility).
   - In the "Configuring the terminal emulator" screen, select **"Use MinTTY"**.
   - Click **Install**.
5. Once installation completes, click **Finish**.

**On macOS:**

```bash
# Git may already be installed. Check with:
git --version

# If not installed, install Xcode Command Line Tools (includes Git):
xcode-select --install

# A popup will appear asking you to install the tools. Click "Install".
# Alternatively, install via Homebrew:
brew install git
```

**On Linux (Ubuntu/Debian):**

```bash
sudo apt update
sudo apt install -y git
```

### 3.4 Verifying the Installations

After installing all required software, open a **new** terminal/command prompt and run the following commands to verify everything is installed correctly:

```bash
# Check Node.js version
node --version
# Expected output: v18.x.x or v20.x.x

# Check npm version
npm --version
# Expected output: 9.x.x or 10.x.x

# Check Git version (if installed)
git --version
# Expected output: git version 2.x.x

# Check MongoDB version
mongod --version
# Expected output: db version v7.x.x
```

If any of these commands fail with "command not found" or a similar error, the corresponding software was not installed correctly. Go back to the relevant section above and verify you completed all steps.

---

## 4. Downloading the Project

There are two ways to get the ShopEZ project files onto your computer:

### 4.1 Cloning from GitHub

This method requires Git to be installed.

1. Open a terminal (Command Prompt, PowerShell, or Terminal).
2. Navigate to the directory where you want to store the project. For example:
   ```bash
   # On Windows:
   cd C:\Users\YourName\Projects

   # On macOS/Linux:
   cd ~/Projects
   ```
3. Create the directory if it doesn't exist:
   ```bash
   mkdir -p Projects
   cd Projects
   ```
4. Clone the repository:
   ```bash
   git clone https://github.com/YOUR_USERNAME/shopez.git
   ```
   Replace `YOUR_USERNAME` with the actual GitHub username where the repository is hosted.
5. Enter the project directory:
   ```bash
   cd shopez
   ```

### 4.2 Alternative: Download as ZIP

If you do not have Git installed, you can download the project as a ZIP file:

1. Open your web browser and navigate to the GitHub repository page.
2. Click the green **"Code"** button.
3. Select **"Download ZIP"**.
4. Save the ZIP file to your computer (e.g., on your Desktop).
5. Extract the ZIP file:
   - **Windows:** Right-click the ZIP file and select **"Extract All..."**, then choose a destination folder.
   - **macOS:** Double-click the ZIP file to automatically extract it.
6. Navigate into the extracted folder using your file explorer.

### 4.3 Exploring the Project Structure

Once you have the project files, open the `shopez` folder. You should see the following top-level structure:

```
shopez/
├── backend/           ← All server-side code
├── frontend/          ← All client-side (browser) code
├── imageseeder.js     ← Script to populate products with real product photography
├── .gitignore         ← Tells Git which files to ignore
├── SETUP_MANUAL.md    ← This setup guide
└── README.md          ← Project documentation
```

Take a moment to open each folder and familiarize yourself with the layout:

- **`backend/`** contains: `config/`, `controllers/`, `middleware/`, `models/`, `routes/`, `utils/`, `server.js`, `app.js`, `seeder.js`, `seedData.js`, `package.json`, and `.env.example`.
- **`frontend/`** contains: `public/`, `src/`, `package.json`, and `.env.example`.
- **`imageseeder.js`** — a standalone script at the project root that updates product images with real product photography from the `images.price.tools` CDN.

---

## 5. Backend Setup — Step by Step

The backend is the server-side component of ShopEZ. It handles API requests from the frontend, communicates with the MongoDB database, manages authentication, and enforces business logic.

### 5.1 Navigating to the Backend Directory

Open a terminal and navigate to the backend directory:

```bash
cd path/to/shopez/backend
```

Replace `path/to/shopez` with the actual path where you extracted/cloned the project.

### 5.2 Installing Backend Dependencies

The backend relies on several third-party packages (dependencies) that need to be downloaded and installed. These are listed in the `package.json` file.

Run the following command:

```bash
npm install
```

**What this command does:**

1. npm reads the `package.json` file to determine which packages are needed.
2. It downloads each package and its dependencies from the npm registry.
3. All packages are placed inside a folder called `node_modules/`.
4. It creates a file called `package-lock.json` that locks the exact version of each package.

**What gets installed:**

The backend has only two runtime dependencies:

| Package                   | Purpose                                                   |
|---------------------------|-----------------------------------------------------------|
| `express`                 | HTTP web framework for routing and middleware              |
| `mongodb`                 | Official MongoDB driver for database operations            |
| `mongodb-memory-server`   | In-memory MongoDB fallback (if local MongoDB unavailable)  |

Plus one development dependency:
| Package    | Purpose                                              |
|------------|------------------------------------------------------|
| `nodemon`  | Auto-restarts the server when code changes            |

All other functionality — JWT authentication, password hashing, CORS, cookie parsing, input validation, environment loading — is implemented using **Node.js built-in modules only** (no third-party packages).

**Expected output:**

```
added 120 packages in 30s
```

**Troubleshooting:**

- If you see permission errors on macOS/Linux, try `sudo npm install` or configure npm to use a different directory (see Section 10.3).
- If you see network errors, check your internet connection and try again.

### 5.3 Understanding the Environment File

The backend needs certain configuration values to run, such as the database connection string, JWT secrets, and port number. These values are stored in a special file called `.env` (environment variables).

The project includes a template file called `.env.example` that shows all the required variables. **The `.env` file is NOT included in the repository** because it contains sensitive information (like passwords and secrets). You must create it yourself.

**Here is what each environment variable does:**

| Variable             | Purpose                                                                 |
|----------------------|-------------------------------------------------------------------------|
| `PORT`               | The port number the backend server will listen on. Default: `5000`.     |
| `MONGO_URI`          | The connection string for MongoDB. Format: `mongodb://host:port/database` |
| `JWT_SECRET`         | A secret key used to sign access tokens. **Must be kept private.**      |
| `JWT_REFRESH_SECRET` | A secret key used to sign refresh tokens. **Must be kept private.**     |
| `JWT_EXPIRES_IN`     | Access token lifetime in **seconds**. Default: `900` (15 minutes).      |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token lifetime in **seconds**. Default: `604800` (7 days). |
| `NODE_ENV`           | The environment mode. `development` enables detailed error messages.    |
| `CLIENT_URL`         | The URL of the frontend application (for CORS). Default: `http://localhost:3000` |

### 5.4 Creating the .env File

**Step 1:** Navigate to the backend directory (if not already there):

```bash
cd path/to/shopez/backend
```

**Step 2:** Copy the `.env.example` file to create a new `.env` file.

**On Windows (Command Prompt):**
```cmd
copy .env.example .env
```

**On Windows (PowerShell):**
```powershell
Copy-Item .env.example .env
```

**On macOS/Linux:**
```bash
cp .env.example .env
```

**Step 3:** Open the `.env` file in a text editor.

**On Windows:**
```cmd
notepad .env
```

**On macOS:**
```bash
open -e .env
```

**On Linux (with nano):**
```bash
nano .env
```

**Step 4:** Review and update the values. The file should look like this:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/shopez
JWT_SECRET=your_jwt_secret_here_change_in_production
JWT_REFRESH_SECRET=your_refresh_secret_here_change_in_production
JWT_EXPIRES_IN=900
JWT_REFRESH_EXPIRES_IN=604800
NODE_ENV=development
CLIENT_URL=http://localhost:3000
```

**Important notes:**
- For local development with a default MongoDB installation, you do **not** need to change any of these values.
- The `JWT_SECRET` and `JWT_REFRESH_SECRET` shown above are for development only. For production, you must generate strong, random secrets (see Section 12).
- The `MONGO_URI` assumes MongoDB is running on your local machine on the default port (27017) with a database named `shopez`. If you are using MongoDB Atlas or a different port, update this value.

**Step 5:** Save and close the file.

### 5.5 Verifying MongoDB is Running

Before starting the backend, ensure MongoDB is running.

**On Windows:**

1. Press `Windows + R`, type `services.msc`, and press Enter.
2. Find **MongoDB Server (MongoDB)** in the list.
3. Check that the "Status" column shows **"Running"**.
4. If it is not running, right-click it and select **Start**.

**On macOS (with Homebrew):**

```bash
brew services list
```
You should see `mongodb-community` with status `started`.

**On Linux:**

```bash
sudo systemctl status mongod
```
You should see `Active: active (running)`.

**To test the connection manually:**

Open a terminal and run:

```bash
mongosh
```

If the MongoDB shell opens and shows a prompt, your database is running. Type `exit` to leave the shell.

### 5.6 Starting the Backend Server

Once dependencies are installed and the `.env` file is created, you can start the backend server.

**For development (with auto-restart):**

```bash
npm run dev
```

This command uses **nodemon**, a tool that monitors your code files for changes and automatically restarts the server when any file is modified. This is extremely useful during development because you don't have to manually stop and restart the server after every change.

**For production (no auto-restart):**

```bash
npm start
```

**Expected output when the server starts successfully:**

```
ShopEZ Server running in development mode on port 5000
MongoDB Connected: localhost
```

**What happens behind the scenes:**

1. `app.js` loads the `.env` file using the custom `utils/env.js` (uses Node.js built-in `fs` module — no `dotenv` package).
2. `server.js` calls `connectDB()` from `config/db.js` which connects to MongoDB using the native `mongodb` driver. If the local MongoDB is unavailable, it automatically falls back to an in-memory MongoDB instance (`mongodb-memory-server`) for development.
3. If the database is empty, `server.js` calls `seedData.js` to auto-populate it with 71 products, 10 users, reviews, orders, and carts.
4. Once connected and seeded, it starts the Express HTTP server on the specified port (5000).
5. The server is now ready to accept API requests.

**To verify the server is running:**

1. Open a web browser.
2. Go to http://localhost:5000/api/products
3. You should see a JSON response. If the database has been seeded (see Section 7), you will see a list of products. If the database is empty, you will see an empty array or an error.

**To stop the server:**

Press `Ctrl + C` in the terminal where the server is running.

---

## 6. Frontend Setup — Step by Step

The frontend is the user-facing part of ShopEZ. It runs in the browser and communicates with the backend through HTTP API calls.

### 6.1 Navigating to the Frontend Directory

Open a **second, separate terminal** and navigate to the frontend directory:

```bash
cd path/to/shopez/frontend
```

**Why a separate terminal?** The backend server is already running in the first terminal. You need a second terminal to run the frontend development server simultaneously.

### 6.2 Installing Frontend Dependencies

Just like the backend, the frontend has its own set of dependencies that need to be installed.

Run:

```bash
npm install
```

This will download and install all packages listed in `frontend/package.json`. The frontend uses only React and its core ecosystem: `react`, `react-dom`, `axios` for HTTP requests, and `react-scripts` (Create React App) for the build toolchain. No UI component libraries, icon libraries, or animation libraries are used — all styling is custom CSS, and icons are hand-crafted SVG components.

**Expected output:**

```
added 1600 packages in 45s
```

The frontend typically has more dependencies than the backend.

### 6.3 Creating the Frontend .env File

The frontend needs to know the URL of the backend API. This is configured through an environment variable called `REACT_APP_API_URL`.

**Step 1:** In the frontend directory, copy the `.env.example` file:

**Windows (Command Prompt):**
```cmd
copy .env.example .env
```

**Windows (PowerShell):**
```powershell
Copy-Item .env.example .env
```

**macOS/Linux:**
```bash
cp .env.example .env
```

**Step 2:** Open the `.env` file and set the API URL:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

This tells the frontend that the backend API is available at `http://localhost:5000/api` (the same address where the backend server is running).

**Step 3:** Save and close the file.

### 6.4 Understanding the Frontend Proxy Configuration

In a typical Create React App setup, the frontend runs on port 3000 and the backend on port 5000. When the frontend needs to call the API, it sends requests to `http://localhost:5000/api/...`.

The `fetchInstance.js` file in `src/api/` reads the API URL from the environment variable and creates an Axios instance:

```javascript
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
});
```

This means:
- If `REACT_APP_API_URL` is set, requests go to that URL.
- If it's not set, requests default to `http://localhost:5000/api`.
- The `withCredentials: true` option ensures that cookies (including the JWT cookies for authentication) are sent with every request.

### 6.5 Starting the Frontend Development Server

Run:

```bash
npm start
```

**What happens:**

1. React's development server starts on port 3000.
2. Your default web browser automatically opens http://localhost:3000.
3. The server compiles the React code and serves it.

**Expected output in the terminal:**

```
Compiled successfully!

You can now view frontend in the browser.

  http://localhost:3000

Note that the development build is not optimized.
To create a production build, use npm run build.
```

**If the browser doesn't open automatically**, manually type `http://localhost:3000` into your browser's address bar.

**Important:** You should now see the ShopEZ homepage with the hero section, category chips, and featured products section. If the database has been seeded, the featured products will display actual products. If not, you will see empty sections but the page should still render.

**To stop the frontend server:**

Press `Ctrl + C` in the terminal where the frontend is running.

---

## 7. Database Seeding — Filling the Application with Data

### 7.1 What is Seeding?

Seeding is the process of populating a database with initial, realistic data so you can test and explore the application without having to manually create users, products, and orders.

The ShopEZ seeder creates a comprehensive dataset with **71 products** across **12 categories**:

- **10 users** — 1 admin, 6 sellers, 3 customers
- **71 products** — covering Electronics (12), Clothing (12), Home & Kitchen (10), Books (8), Sports (6), Beauty (6), Toys & Games (4), Automotive (3), Health (3), Groceries (3), Jewelry (2), and Music (2)
- **30 reviews** — spread across products with ratings and comments
- **1 sample order** — placed by the "Ojas Tester" customer
- **10 carts** — Empty shopping carts for each user

### 7.2 Running the Seeder

**There are two ways the database gets seeded:**

**Method A: Automatic (on server start)**
When you start the backend with `npm run dev` or `npm start`, the server checks if the database is empty. If it is, it automatically runs `seedData.js` to populate everything. The output looks like:

```
MongoDB Connected: localhost
Database is empty. Auto-seeding...
Creating 10 users...
Creating 71 products...
Creating 30 reviews...
Creating 1 sample order...
Creating 10 carts...
Auto-seeding complete!
ShopEZ Server running in development mode on port 5000
```

**Method B: Manual (using seeder script)**
If you need to reset the database at any time, manually run the seeder:

**Step 1:** Navigate to the backend directory:
```bash
cd path/to/shopez/backend
```

**Step 2:** Run the seed command:
```bash
npm run seed
```

This executes `node seeder.js --import`.

**Expected output:**
```
MongoDB Connected: localhost
Data destroyed.
Creating users...
  10 users created
Creating products...
  71 products created
Creating reviews...
  30 reviews created
Creating orders...
  1 order created
Creating carts...
  10 carts created
Seeding complete!
```

**What happens step by step:**

1. The script connects to MongoDB using the `MONGO_URI` from your `.env` file.
2. It **destroys all existing data** first to ensure a clean state.
3. It hashes passwords for all 10 users using Node.js built-in `crypto.scrypt` (this is computationally intensive and may take a few seconds).
4. It creates all 10 users in the database.
5. It creates 71 products across 12 categories, each linked to their respective seller.
6. It creates 30 reviews, linking them to the correct user and product.
7. It creates 1 sample order with the proper structure (items, prices, shipping address, etc.).
8. It creates an empty cart for each user.
9. It disconnects from MongoDB and exits.

**Note:** The seeder uses raw MongoDB operations through the native `mongodb` driver. It does NOT use Mongoose ORM or the `bcryptjs` package — password hashing is done with Node.js built-in `crypto.scrypt`.

### 7.3 Understanding the Seed Data

**Users created:**

| Name                | Email                 | Password   | Role    |
|---------------------|-----------------------|------------|---------|
| ShopEZ Admin        | admin@shopez.com      | Admin@123  | ADMIN   |
| TechZone India      | seller1@shopez.com    | Seller@123 | SELLER  |
| StyleHub            | seller2@shopez.com    | Seller@123 | SELLER  |
| Home Essentials Co. | seller3@shopez.com    | Seller@123 | SELLER  |
| BookWorm Publishers | seller4@shopez.com    | Seller@123 | SELLER  |
| SportFit India      | seller5@shopez.com    | Seller@123 | SELLER  |
| Glamour Beauty      | seller6@shopez.com    | Seller@123 | SELLER  |
| Ojas Tester         | user@shopez.com       | User@123   | USER    |
| Priya Sharma        | priya@example.com     | User@123   | USER    |
| Arun Kumar          | arun@example.com      | User@123   | USER    |

**Products (71 total across 12 categories):**

| Seller               | Category        | Products                                                                 |
|----------------------|-----------------|--------------------------------------------------------------------------|
| TechZone India       | Electronics     | 12 products: phones, laptops, headphones, camera, smartwatch, speaker, TV, iPad, keyboard combo |
| TechZone India       | Music           | 2 products: Acoustic Guitar, Bluetooth Turntable                         |
| StyleHub             | Clothing        | 12 products: polo shirts, kurtis, jeans, shoes, blazers, dresses, sweaters, jackets, gowns, wallets, sunglasses, belts |
| StyleHub             | Jewelry         | 2 products: Silver Necklace, Pearl Stud Earrings                         |
| StyleHub             | Toys & Games    | 4 products: LEGO Millennium Falcon, RC Car, Board Game Set, Science Kit  |
| Home Essentials Co.  | Home & Kitchen  | 10 products: cookware set, candles, bed sheets, air fryer, desk lamp, stand mixer, wall clock, cutting boards, coffee maker, robot vacuum |
| Home Essentials Co.  | Automotive      | 3 products: Dash Camera, Seat Covers, Tire Inflator                      |
| Home Essentials Co.  | Groceries       | 3 products: Green Tea Collection, Dry Fruits Gift Box, Organic Honey     |
| BookWorm Publishers  | Books           | 8 products: Atomic Habits, The Alchemist, Rich Dad Poor Dad, Lean Startup, Sapiens, Psychology of Money, Great Gatsby, Thinking Fast & Slow |
| SportFit India       | Sports          | 6 products: Yoga Mat, Dumbbell Set, Mountain Bike, Swimming Goggles, Tennis Racket, Fitness Tracker |
| Glamour Beauty       | Beauty          | 6 products: Vitamin C Serum, Face Moisturizer, Perfume Collection, Hair Dryer, Lipstick Set, Hair Growth Oil |
| Glamour Beauty       | Health          | 3 products: BP Monitor, Multivitamin Tablets, Ergonomic Office Chair     |

### 7.4 Destroying All Data

If you ever want to wipe the database clean (e.g., to start fresh), run:

```bash
npm run seed:destroy
```

This executes `node seeder.js --destroy`.

**Important:** The script asks for confirmation to prevent accidental data loss:

```
WARNING: This will permanently delete all data in the database.
Are you sure? Type 'yes' to confirm:
```

You must type `yes` and press Enter to proceed. Any other input will cancel the operation.

After running `--destroy`, you can run `npm run seed` again to repopulate the database with fresh data.

### 7.5 Product Images Seeding

By default, the seeder assigns placeholder images (from `picsum.photos`) to all products. To replace these with **real product photography**, run the image seeder script:

```bash
# From the project root directory (shopez/)
node imageseeder.js
```

**What this does:**

1. Connects to the same MongoDB database.
2. For each of the 52 supported products, it updates the image array with real product photographs sourced from the `images.price.tools` CDN (used by pricehistory.app).
3. Products that do not have matching images on the CDN (e.g., books, some clothing items) retain their original placeholder images.

**Expected output:**

```
samsung-galaxy-m34-5g: UPDATED
boat-airdopes-141-earbuds: UPDATED
...
Done! Updated 52/52 products.
```

**Important:** Run this only once after seeding. Re-running it on an already-updated database will show "not found" for already-updated products (this is expected — the script reports `modifiedCount` which is 0 if the images are already set to the same URLs).

**Image source:** The `images.price.tools` CDN hosts real manufacturer/product images indexed by pricehistory.app. Each image URL follows this pattern:

```
https://images.price.tools/images/{product-description}-{size}-{8charhash}.jpg
```

Where `{size}` is `l` (large), `m` (medium), or `s` (small), and `{8charhash}` is a random 8-character hash.

---

## 8. First-Time Login & Navigation Walkthrough

This section guides you through your first login and a brief tour of the application. Make sure both the backend server (Section 5.6) and frontend server (Section 6.5) are running.

### 8.1 Opening the Application

1. Open your web browser.
2. Navigate to http://localhost:3000
3. You should see the ShopEZ homepage:

   - **Header:** A navigation bar with the "ShopEZ" logo on the left, a search bar in the middle, and "Log In" / "Sign Up" buttons on the right.
   - **Hero Section:** A large banner with the text "Shop Everything. Find Anything." with a "Shop Now" button.
   - **Categories:** A horizontal scroll of category chips (Electronics, Clothing, etc.).
   - **Featured Products:** A horizontal carousel of product cards.
   - **Promo Banner:** A "Summer Sale" promotional banner.
   - **Footer:** Links and copyright information.

### 8.2 Logging in as a Customer

1. Click **"Log In"** in the top-right corner of the navigation bar.
2. You will be taken to the login page at `/login`. The page has:
   - A left panel with the ShopEZ branding and a shopping bag icon.
   - A right panel with the login form.
3. Enter the following credentials:
   - **Email:** `user@shopez.com`
   - **Password:** `User@123`
4. Click **"Log In"**.
5. **Expected result:**
   - A success toast appears: "Welcome back!"
   - You are redirected to the homepage.
   - The navigation bar now shows the user's first name ("Ojas") and a cart icon.
6. **Click on your name** to open the user dropdown, which shows:
   - **My Orders** — link to your order history.
   - **Logout** — button to log out.

**Exploring as a customer:**

1. Go to **/products** — browse all 12 products. Use the search bar, category filter sidebar, and sort dropdown.
2. Click on **"Samsung Galaxy M34 5G"** — view the product detail page with images, pricing, description, and reviews.
3. Click **"Add to Cart"** — the item is added to your cart. You can see the cart count badge update in the navbar.
4. Click the **cart icon** in the navbar — view your cart with quantity controls and price summary.
5. Click **"Proceed to Checkout"** — start the 3-step checkout process:
   - **Step 1:** Enter a delivery address (full name, phone, street, city, state, pincode).
   - **Step 2:** Choose a payment method (COD, UPI, Card, or Net Banking).
   - **Step 3:** Review your order and click "Place Order".
6. After placing the order, you are redirected to the **order confirmation page** with a success animation and order ID.
7. Go to **/my-orders** — view your order history with expandable details and cancellation option.

**To log out:**

Click on your name in the navbar and select **"Logout"**. You will be redirected to the homepage and the navbar will return to showing "Log In" / "Sign Up".

### 8.3 Logging in as a Seller

1. Log out if you are currently logged in.
2. Go to `/login` and enter:
   - **Email:** `seller1@shopez.com`
   - **Password:** `Seller@123`
3. Click **"Log In"**.
4. Open the user dropdown by clicking on your name. Notice the dropdown now includes **"Seller Dashboard"**.
5. Click **"Seller Dashboard"** to access `/seller/dashboard`.

**Seller Dashboard Overview:**

The dashboard has three tabs:

**Tab 1: Overview**
- Four stat cards showing: Total Products, Total Orders, Total Revenue, and Average Rating.
- A Revenue chart (line graph showing monthly revenue trends).
- An Orders-by-Status chart (donut chart showing the distribution of order statuses).

**Tab 2: My Products**
- A table listing all of TechZone India's products.
- Each row shows: image, name, category, price (with discount), stock count, active/inactive status, and action buttons (Edit, Toggle Active, Delete).
- A **"Add New Product"** button opens a slide-out drawer form to create a new product.
- Clicking the **Edit** icon opens the same drawer pre-filled with the product data.

**Tab 3: Incoming Orders**
- A table of orders placed by customers for this seller's products.
- Status filter tabs (All, Pending, Confirmed, Shipped, Delivered).
- A status update dropdown that shows valid transitions (e.g., Pending → Confirmed or Cancelled, Confirmed → Shipped).

### 8.4 Logging in as an Administrator

1. Log out if you are currently logged in.
2. Go to `/login` and enter:
   - **Email:** `admin@shopez.com`
   - **Password:** `Admin@123`
3. Click **"Log In"**.
4. Open the user dropdown. Notice it includes both **"Seller Dashboard"** and **"Admin Panel"**.

**Admin Dashboard Overview:**

The dashboard has four tabs:

**Tab 1: Overview**
- Four stat cards: Total Users, Total Sellers, Total Products, Total Revenue.
- Revenue chart and Orders-by-Status chart.
- A "Top 5 Products by Revenue" table.

**Tab 2: Users**
- A searchable table of all registered users.
- Each row shows: avatar initial, name, email, role (colored badge), active status (green/red dot), join date.
- Actions: Change role via dropdown, Toggle active/inactive, Delete user (with typed-email confirmation for safety).

**Tab 3: Orders**
- A table of every order in the system with status filter tabs.
- Click a row to expand it and see customer details, shipping address, and itemized product list.

**Tab 4: Products**
- A table of every product in the system.
- Each row shows: image, name, category, price, stock, seller name, status.
- Actions: Toggle active/inactive, View product (opens in new tab).

---

## 9. User Roles Explained

ShopEZ has a three-tier role system. Each role has specific permissions and visible UI elements.

### 9.1 Customer (USER) Role

**What they can do:**
- Browse the product catalog with search, filter, and sort.
- View product details, images, and customer reviews.
- Add products to the shopping cart and manage cart quantities.
- Place orders through the multi-step checkout process.
- View their order history and cancel pending orders.
- Write and delete their own product reviews.
- Update their profile (name, email, address).

**UI differences:**
- Navbar shows "My Orders" link in the user dropdown.
- Cart icon in the navbar.
- The "Write a Review" section appears on product pages (for verified purchasers).
- No access to `/seller/dashboard` or `/admin/dashboard`.

### 9.2 Seller (SELLER) Role

**Everything a Customer can do, plus:**
- Access the Seller Dashboard (`/seller/dashboard`).
- View analytics: total products, orders, revenue, average rating.
- Manage their product catalog (Add, Edit, Toggle Active/Inactive, Delete).
- View incoming orders for their products.
- Update order status (Confirm → Ship → Deliver).

**UI differences:**
- Navbar dropdown includes "Seller Dashboard" link.
- The seller dashboard has dedicated tabs for products and orders management.
- Sellers can only see and manage their own products and orders — they cannot access or modify other sellers' data.

**How to become a SELLER:**
- Register as a new user with the role set to "Sell" (the registration form has a radio button).
- **Or** an ADMIN can change your role from USER to SELLER via the Admin Dashboard.

### 9.3 Administrator (ADMIN) Role

**Everything a Customer and Seller can do, plus:**
- Access the Admin Dashboard (`/admin/dashboard`).
- View system-wide analytics: total users, sellers, products, revenue, top products.
- Manage all users: change roles, activate/deactivate, delete permanently (with cascade).
- View all orders in the system with status filtering.
- Moderate all products: activate/deactivate.
- 

**UI differences:**
- Navbar dropdown includes both "Seller Dashboard" and "Admin Panel" links.
- The admin dashboard has four tabs covering users, orders, and products across the entire platform.
- Admins see everything and can take action on any record.

**Security note:** There should be very few ADMIN accounts. Only trusted users should be granted this role.

---

## 10. Common Issues & Troubleshooting

This section diagnoses and resolves the most common problems you may encounter.

### 10.1 MongoDB Connection Refused

**Error message:**
```
MongoDB Connection Error: connect ECONNREFUSED ::1:27017
```
**or**
```
MongoDB Connection Error: connect ECONNREFUSED 127.0.0.1:27017
```
**or**
```
Local MongoDB not available, starting in-memory MongoDB...
```

**Cause:** MongoDB is not running on your machine, or it is running on a different port.

**Solutions:**

1. **Start MongoDB:**
   - **Windows:** Open Services (`services.msc`), find "MongoDB Server (MongoDB)", right-click and select "Start".
   - **macOS:** `brew services start mongodb-community@7.0`
   - **Linux:** `sudo systemctl start mongod`

2. **Verify MongoDB is listening:**
   ```bash
   mongosh
   ```
   If this opens the MongoDB shell, the database is running.

3. **Check the connection string** in `backend/.env`:
   ```env
   MONGO_URI=mongodb://localhost:27017/shopez
   ```
   - If MongoDB is not running on the default port (27017), update the port.
   - If you are using MongoDB Atlas, replace the entire URI with your Atlas connection string.

4. **If MongoDB is running but still refused:**
   - MongoDB 6+ may listen on IPv6 (`::1`) instead of IPv4 (`127.0.0.1`). Try setting `MONGO_URI=mongodb://127.0.0.1:27017/shopez` (using the IPv4 loopback explicitly).

### 10.2 Port Already in Use

**Error message:**
```
Error: listen EADDRINUSE: address already in use :::5000
```
**or**
```
Error: listen EADDRINUSE: address already in use :::3000
```

**Cause:** Another process is already using the port.

**Solutions:**

1. **Find and kill the process using the port:**

   **On Windows (Command Prompt):**
   ```cmd
   netstat -ano | findstr :5000
   taskkill /PID <PID> /F
   ```

   **On Windows (PowerShell):**
   ```powershell
   Get-Process -Id (Get-NetTCPConnection -LocalPort 5000).OwningProcess | Stop-Process
   ```

   **On macOS/Linux:**
   ```bash
   lsof -i :5000
   kill -9 <PID>
   ```

2. **Use a different port:**
   - Edit `backend/.env` and change `PORT=5000` to a different port (e.g., `PORT=5001`).
   - Update `frontend/.env` to point to the new port: `REACT_APP_API_URL=http://localhost:5001/api`.

3. **If port 3000 is in use (frontend):**
   - React's development server will automatically prompt you to use a different port. Type `y` and press Enter.
   - Or set the PORT environment variable: `set PORT=3001 && npm start` (Windows) or `PORT=3001 npm start` (macOS/Linux).

### 10.3 npm Installation Fails

**Error message examples:**
```
npm ERR! code EACCES
npm ERR! syscall mkdir
npm ERR! path /usr/local/lib/node_modules
```
**or**
```
npm ERR! code ENOTFOUND
npm ERR! errno ENOTFOUND
npm ERR! request to https://registry.npmjs.org/xxx failed
```

**Common causes and solutions:**

1. **Permission errors (macOS/Linux):**
   ```bash
   # Never use sudo npm install. Instead, fix the npm permissions:
   sudo chown -R $(whoami) ~/.npm
   sudo chown -R $(whoami) /usr/local/lib/node_modules
   ```
   Or use a Node version manager like nvm to avoid permission issues entirely.

2. **Network errors:**
   ```bash
   # Switch to a different npm registry (mirror)
   npm config set registry https://registry.npmmirror.com
   
   # Or use a proxy if behind a corporate firewall
   npm config set proxy http://proxy.company.com:8080
   npm config set https-proxy http://proxy.company.com:8080
   ```

3. **Clear npm cache and retry:**
   ```bash
   npm cache clean --force
   rm -rf node_modules
   rm -rf package-lock.json
   npm install
   ```

4. **Node.js version too old:**
   - Verify with `node --version`. You need v18.x or higher.
   - Download and install the latest LTS version from https://nodejs.org.

### 10.4 CORS Errors in Browser

**Error message in browser console:**
```
Access to XMLHttpRequest at 'http://localhost:5000/api/...' from origin 'http://localhost:3000' has been blocked by CORS policy
```

**Cause:** The browser blocks requests from the frontend (port 3000) to the backend (port 5000) due to the Same-Origin Policy.

**Solutions:**

1. **Verify `CLIENT_URL` is set correctly** in `backend/.env`:
   ```env
   CLIENT_URL=http://localhost:3000
   ```
   This must match the frontend URL exactly (including the port).

2. **Restart the backend** after changing `.env`. Changes to `.env` only take effect after restarting the server.

3. **Check if the backend is running.** Run `npm run dev` in the backend directory.

4. **Verify the backend logs** show `development mode`. CORS is configured in `app.js` using the custom `utils/cors.js` middleware (no third-party CORS package):
   ```javascript
   const { corsMiddleware } = require('./utils/cors');
   app.use(corsMiddleware({
     origin: process.env.CLIENT_URL,
     credentials: true,
   }));
   ```

### 10.5 Blank Page or Build Errors

**Symptom:** The application opens but shows a blank white page. The browser console may show errors.

**Solutions:**

1. **Check the browser console** (F12 → Console tab) for specific error messages.

2. **Clear the build cache and rebuild:**
   ```bash
   cd frontend
   rm -rf node_modules/.cache
   npm run build
   ```
   Or simply delete the `build/` folder if it exists.

3. **Verify all imports are correct.** Common issues:
   - Missing file extensions (`.js` extension is optional in most cases).
   - Incorrect relative paths (e.g., `../../components/` instead of `../components/`).

4. **Check for JavaScript syntax errors:**
   ```bash
   cd frontend
   npx react-scripts build
   ```
   This will show compilation errors with file names and line numbers.

### 10.6 Authentication Fails / Cannot Log In

**Symptom:** Login request returns an error, or login appears successful but the page does not update.

**Solutions:**

1. **Verify the backend is running** and accessible. Try visiting http://localhost:5000/api/auth/me in your browser. You should see a JSON error (since you're not authenticated).

2. **Clear cookies for localhost:**
   - In Chrome: Click the lock icon in the address bar → Cookies → Select all → Remove.
   - Or use the browser's Developer Tools (F12) → Application → Storage → Cookies → Clear.

3. **Check if the cookies are being set:**
   - F12 → Application → Cookies → `http://localhost:3000`
   - You should see cookies named `accessToken` and `refreshToken` (or `jwt` depending on implementation).
   - If no cookies appear, the backend may not be setting them. Check the `authController.js` for cookie settings.

4. **Verify the credentials.** Use the default credentials from Appendix A. Ensure there is no trailing space in the email or password.

5. **Restart both servers** (backend and frontend) and try again.

### 10.7 Database Seeding Fails

**Error messages:**
```
MongoDB Connection Error: ...
```
**or**
```
MongoBulkWriteError: E11000 duplicate key error collection: ...
```

**Solutions:**

1. **Ensure MongoDB is running** (see Section 10.1).

2. **Check the `.env` file** — make sure `MONGO_URI` is correct.

3. **If MongoDB schema validation errors occur during seeding:**
   - The seeder data may not match the model's `$jsonSchema` validator. Check the model files (`backend/models/`) for required fields and enum values.
   - Ensure category names match exactly (e.g., "Electronics" not "electronics").

4. **Run the destroy command first** to ensure a clean slate:
   ```bash
   npm run seed:destroy
   npm run seed
   ```

5. **Check for duplicate key errors:**
   - If you run the seeder twice without destroying first, you'll get duplicate email/slug errors because of unique indexes.
   - The seeder automatically destroys data before importing, but manual `npm run seed:destroy` ensures a completely clean state.

6. **If the auto-seed fails on server start:**
   - The server's auto-seed function (`seedData.js`) is only triggered when the database has zero users.
   - If partial data exists, delete all collections manually via `mongosh` and restart the server.

### 10.8 Cookie Not Set / Not Sent

**Symptom:** API requests return 401 (Unauthorized) even after successful login. The `accessToken` cookie is not visible in the browser's Application tab.

**Solutions:**

1. **Ensure `withCredentials: true`** is set in the API request. This is configured in `fetchInstance.js`:
   ```javascript
   const api = axios.create({
     baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
     withCredentials: true,
   });
   ```

2. **Check the backend CORS configuration** in `app.js`:
   ```javascript
   app.use(cors({
     origin: process.env.CLIENT_URL,
     credentials: true,
   }));
   ```
   Both `origin` and `credentials` must be set.

3. **Verify `CLIENT_URL`** does not have a trailing slash:
   - Correct: `http://localhost:3000`
   - Incorrect: `http://localhost:3000/`

4. **Check the cookie settings in the backend** (`utils/jwt.js`):
   - The cookie is set via `Set-Cookie` headers directly in the `sendTokenResponse` function.
   - It uses `httpOnly: true`, `secure: false` (for development over HTTP), and `sameSite: 'Strict'`.
   - For local development, `secure: true` would prevent cookies from being sent over HTTP. The code conditionally sets `Secure` only when `NODE_ENV === 'production'`.

5. **Restart the backend** after making any changes to CORS or cookie settings.

---

## 11. Application Architecture Overview

### 11.1 Backend Architecture

The backend follows a **layered architecture** pattern:

```
Request → Router → Middleware → Controller → Model → MongoDB
```

**Layer 1: Router (`routes/`)**
- Defines the URL endpoints and HTTP methods.
- Attaches middleware for authentication, validation, and authorization.
- Routes the request to the appropriate controller function.

**Layer 2: Middleware (`middleware/`)**
- **Authentication Middleware:** Verifies the JWT in the cookie using the custom `utils/jwt.js` (Node.js built-in `crypto` module, no `jsonwebtoken` package) and attaches the user to the request.
- **Authorization Middleware:** Checks if the authenticated user has the required role (USER, SELLER, ADMIN).
- **Validation Middleware:** Validates request body data using custom `utils/validate.js` (no `express-validator` package).
- **Error Middleware:** Catches all errors and sends a standardized error response using `AppError` class.
- **Not Found Middleware:** Catches requests to undefined routes.

**Layer 3: Controller (`controllers/`)**
- Contains the business logic for each endpoint.
- Calls the appropriate Model methods to interact with the database.
- Sends the HTTP response back to the client.
- Uses `catchAsync` to automatically catch and forward errors to the error middleware.

**Layer 4: Model (`models/`)**
- Defines the MongoDB collection schema and operations for each entity (User, Product, Order, Review, Cart).
- Uses **raw MongoDB driver operations** (no Mongoose ORM). Each model file exports an object with methods like `findById`, `create`, `updateOne`, etc., all using the native `mongodb` driver.
- Schema validation is enforced via MongoDB's `$jsonSchema` validator (e.g., User model validates email format and password length at the database level).
- Contains business logic hooks (e.g., password hashing via Node.js built-in `crypto.scrypt` before creating a User, calculating average ratings after saving a Review).

**Key files:**

| File                   | Purpose                                                    |
|------------------------|------------------------------------------------------------|
| `server.js`            | Entry point — connects to DB, auto-seeds if empty, starts the HTTP server. |
| `app.js`               | Express application setup — custom middleware stack and route mounting. |
| `seeder.js`            | Standalone script to populate the database with sample data. |
| `seedData.js`          | Auto-seed function called by `server.js` when the database is empty. |
| `config/db.js`         | MongoDB connection function using native `mongodb` driver + in-memory fallback. |
| `utils/jwt.js`         | Custom JWT signing, verification using Node.js `crypto` module (no jsonwebtoken). |
| `utils/AppError.js`    | Custom error class for operational (expected) errors.      |
| `utils/cors.js`        | Custom CORS middleware (no third-party cors package).       |
| `utils/cookies.js`     | Custom cookie parsing (no cookie-parser package).           |
| `utils/env.js`         | Custom .env file loading (no dotenv package).              |
| `utils/validate.js`    | Custom input validation functions (no express-validator).  |

### 11.2 Frontend Architecture

The frontend follows a **component-based architecture**:

```
Browser → App.js → Providers → Router → Layout → Pages → Components
```

**Layer 1: Providers (`context/` and `contexts/`)**
- **AuthContext:** Manages authentication state (user, isAuthenticated, isLoading). Provides login, register, and logout functions. Hydrates from cookies on initial load.
- **CartContext:** Manages global cart state (items, itemCount, totalPrice). Uses optimistic updates with debounced API sync.

**Layer 2: Custom Router (`src/router/Router.js`)**
- A custom-built SPA router implemented from scratch using React Context and hooks (no `react-router-dom` dependency — though the package is installed, the app uses its own lightweight router).
- The router components (`BrowserRouter`, `Routes`, `Route`, `Link`, `Navigate`) are built with basic React primitives:
  - `BrowserRouter` — wraps the app, provides location state and navigation API via React Context.
  - `Routes` — iterates over `Route` children, matches the current URL path using a pattern matching function, and renders the matching component.
  - `Route` — a thin wrapper that holds the `path` and `element` props.
  - `Link` — renders an `<a>` tag with navigation handled via `ctx.navigate()`.
  - `Navigate` — a component that imperatively redirects on render via `useEffect`.
- Route guards (`PrivateRoute`, `SellerRoute`, `AdminRoute`) check authentication state from `AuthContext` and redirect if unauthorized.
- Implements lazy loading (React.lazy + Suspense) for code splitting.

**Layer 3: Layout (`components/layout/`)**
- **Navbar:** Responsive navigation with search, cart badge, user dropdown, and mobile menu.
- **Footer:** Site links and copyright information.
- **Layout:** Combines Navbar, page content, and Footer.

**Layer 4: Pages (`pages/`)**
- Each page is a top-level route component that composes multiple smaller components.
- Pages use **hooks** for data fetching (`useFetch`) and state management (`useAuth`, `useCart`).

**Layer 5: Components (`components/`)**
- **Common:** Reusable UI elements (Pagination, EmptyState, ErrorState, route guards).
- **Products:** ProductCard, ProductCardSkeleton, ProductFilter, StarRating, ReviewCard.
- **Orders:** OrderStatusBadge.
- **Charts:** RevenueChart, OrdersDonutChart.
- **Utility:** ErrorBoundary, SEOHead.

**Key files:**

| File                           | Purpose                                                   |
|--------------------------------|-----------------------------------------------------------|
| `src/App.js`                   | Root component — providers, routers, and lazy-loaded routes. |
| `src/index.js`                 | ReactDOM entry point.                                     |
| `src/index.css`                | Global styles, design tokens, keyframes.                  |
| `src/api/fetchInstance.js`     | Configured Axios instance with cookies and 401 interceptor. |
| `src/context/AuthContext.js`   | Authentication state management and cookie hydration.     |
| `src/contexts/CartContext.js`  | Global cart state with optimistic updates.                |
| `src/hooks/useFetch.js`       | Generic data fetching hook with AbortController support.  |

### 11.3 Data Flow Diagram

The following describes how data flows through the application when a user performs a typical action (e.g., adding a product to the cart):

```
1. USER ACTION (browser)
   User clicks "Add to Cart" button on the Product Detail page.

2. REACT EVENT HANDLER
   ProductDetailPage calls: addToCart(productId, quantity)
   This function is provided by CartContext via the useCart hook.

3. OPTIMISTIC UPDATE
   CartContext immediately updates the local state (adds the item)
   and dispatches an action to the reducer. The UI updates instantly.

4. DEBOUNCED API CALL
   After 300ms (debounce timer), CartContext calls:
   cartAPI.addToCart(productId, quantity)
   This sends a POST request to the backend.

5. AXIOS INSTANCE
   axiosInstance adds:
   - Base URL: http://localhost:5000/api
   - Credentials: httpOnly cookie with JWT
   - Content-Type: application/json

6. BACKEND ROUTER
   POST /api/cart → cartRouter → authMiddleware.requiresAuth → cartController.addToCart

7. AUTHENTICATION MIDDLEWARE
   authMiddleware.requiresAuth:
   - Reads the accessToken cookie from the request.
   - Verifies the JWT signature using JWT_SECRET.
   - Attaches the user payload to req.user.

8. CONTROLLER
   cartController.addToCart:
   - Finds or creates a cart for the authenticated user.
   - Adds the product to the items array or increments quantity.
   - Saves the cart to MongoDB.
   - Returns the updated cart as JSON.

9. RESPONSE
   The backend sends the response back to the frontend.

10. STATE UPDATE
    CartContext receives the response, updates the global state
    with the server-confirmed data. The UI re-renders with the
    latest cart state.

11. UI REFLECTS CHANGE
    - Navbar shows updated cart count badge.
    - CartPage shows the item with correct quantity and price.
```

---

## 12. Production Deployment Checklist

When you are ready to deploy ShopEZ to a production server, follow this checklist. **This is critical for security and stability.**

### Security

- [ ] **Change all default passwords.** The seed data passwords (`Admin@123`, `Seller@123`, `User@123`) must never be used in production.
- [ ] **Generate strong JWT secrets.** Use the following command to generate cryptographically secure random strings:
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```
  Copy the output and use it for both `JWT_SECRET` and `JWT_REFRESH_SECRET` in `.env`.
- [ ] **Set `NODE_ENV=production`** in the backend `.env`. This disables detailed error messages and morgan logging.
- [ ] **Enable `secure: true` for cookies** in the backend. The `utils/jwt.js` `sendTokenResponse` function conditionally sets `Secure` based on `NODE_ENV`. In production, ensure cookies are only sent over HTTPS.
- [ ] **Update CORS origin** — set `CLIENT_URL` to your actual production frontend domain.
- [ ] **Remove `nodemon`** from production dependencies. Run `npm install --production` to install only production dependencies.
- [ ] **Use HTTPS.** Set up SSL/TLS certificates using Let's Encrypt or your hosting provider.

### Backend

- [ ] **Set up a process manager** like PM2 to keep the Node.js server running:
  ```bash
  npm install -g pm2
  pm2 start server.js --name shopez-api
  pm2 save
  pm2 startup
  ```
- [ ] **Set up MongoDB in production** — use MongoDB Atlas (cloud) or a dedicated server with authentication enabled.
- [ ] **Configure the rate limiter** — adjust the limit in `app.js` based on your expected traffic.
- [ ] **Set up logging** — configure file-based or cloud-based logging (e.g., Winston, Morgan with log files).

### Frontend

- [ ] **Build the frontend for production:**
  ```bash
  cd frontend
  npm run build
  ```
- [ ] **Set `REACT_APP_API_URL`** to your production backend URL before building.
- [ ] **Serve the built frontend** from your backend's `public/` folder or use a dedicated web server (Nginx, Apache, or a CDN).
- [ ] **Enable gzip/Brotli compression** on your web server.

### Database

- [ ] **Set up automated backups** using `mongodump` or a cloud backup service.
- [ ] **Create a database user with limited permissions** — never use the root MongoDB user.
- [ ] **Run database indexes** — ensure all MongoDB indexes are created. Indexes are defined in each model's `initCollection()` method and are created automatically when the server starts.

### Monitoring

- [ ] **Set up uptime monitoring** (e.g., UptimeRobot, Pingdom).
- [ ] **Set up error tracking** (e.g., Sentry, LogRocket).
- [ ] **Monitor server resources** (CPU, RAM, disk) using tools like `htop`, `glances`, or cloud monitoring dashboards.

---

## 13. Appendix A: Complete Default Credentials

> ⚠️ **WARNING:** These credentials are for **development and testing only**. Change ALL passwords before deploying to production.

| Role     | Name                | Email                 | Password    | Can Access               |
|----------|---------------------|-----------------------|-------------|--------------------------|
| ADMIN    | ShopEZ Admin        | admin@shopez.com      | Admin@123   | Everything                |
| SELLER   | TechZone India      | seller1@shopez.com    | Seller@123  | Seller Dashboard          |
| SELLER   | StyleHub            | seller2@shopez.com    | Seller@123  | Seller Dashboard          |
| SELLER   | Home Essentials Co. | seller3@shopez.com    | Seller@123  | Seller Dashboard          |
| SELLER   | BookWorm Publishers | seller4@shopez.com    | Seller@123  | Seller Dashboard          |
| SELLER   | SportFit India      | seller5@shopez.com    | Seller@123  | Seller Dashboard          |
| SELLER   | Glamour Beauty      | seller6@shopez.com    | Seller@123  | Seller Dashboard          |
| USER     | Ojas Tester         | user@shopez.com       | User@123    | Shopping, My Orders       |
| USER     | Priya Sharma        | priya@example.com     | User@123    | Shopping, My Orders       |
| USER     | Arun Kumar          | arun@example.com      | User@123    | Shopping, My Orders       |

---

## 14. Appendix B: Complete API Endpoint Reference

### Authentication

| Method | Endpoint                          | Auth Required | Role Required | Description                            |
|--------|-----------------------------------|---------------|---------------|----------------------------------------|
| POST   | `/api/auth/register`              | No            | —             | Register a new user account            |
| POST   | `/api/auth/login`                 | No            | —             | Log in with email and password         |
| POST   | `/api/auth/logout`                | No            | —             | Clear authentication cookies           |
| GET    | `/api/auth/me`                    | Yes           | —             | Get the currently logged-in user's profile |
| PATCH  | `/api/auth/update-password`       | Yes           | —             | Update the current user's password     |
| POST   | `/api/auth/refresh`               | No            | —             | Refresh an expired access token        |

### Products

| Method | Endpoint                          | Auth Required | Role Required | Description                            |
|--------|-----------------------------------|---------------|---------------|----------------------------------------|
| GET    | `/api/products`                   | No            | —             | List products (supports filter, sort, search, pagination) |
| GET    | `/api/products/featured`          | No            | —             | Get featured products                  |
| GET    | `/api/products/categories`        | No            | —             | Get product categories with counts     |
| GET    | `/api/products/:slug`             | No            | —             | Get a single product by its URL slug   |
| POST   | `/api/products`                   | Yes           | SELLER        | Create a new product                   |
| PATCH  | `/api/products/:id`               | Yes           | SELLER        | Update a product (only own products)   |
| DELETE | `/api/products/:id`               | Yes           | SELLER        | Delete a product (only own products)   |

### Cart

| Method | Endpoint                          | Auth Required | Role Required | Description                            |
|--------|-----------------------------------|---------------|---------------|----------------------------------------|
| GET    | `/api/cart`                       | Yes           | —             | Get the current user's cart            |
| POST   | `/api/cart/add`                   | Yes           | —             | Add an item to the cart                |
| PATCH  | `/api/cart/update`                | Yes           | —             | Update the quantity of a cart item     |
| DELETE | `/api/cart/remove/:productId`     | Yes           | —             | Remove an item from the cart           |
| DELETE | `/api/cart/clear`                 | Yes           | —             | Clear all items from the cart          |

### Orders

| Method | Endpoint                          | Auth Required | Role Required | Description                            |
|--------|-----------------------------------|---------------|---------------|----------------------------------------|
| POST   | `/api/orders`                     | Yes           | —             | Create a new order from the cart       |
| GET    | `/api/orders/my-orders`           | Yes           | —             | Get the current user's orders (paginated) |
| GET    | `/api/orders/:id`                 | Yes           | —             | Get a single order by its ID           |
| PATCH  | `/api/orders/:id/cancel`          | Yes           | —             | Cancel a pending order                 |
| PATCH  | `/api/orders/:id/status`          | Yes           | SELLER        | Update the status of a seller's order  |

### Reviews

| Method | Endpoint                          | Auth Required | Role Required | Description                            |
|--------|-----------------------------------|---------------|---------------|----------------------------------------|
| POST   | `/api/reviews`                    | Yes           | —             | Create a review for a product          |
| GET    | `/api/reviews/product/:productId` | No            | —             | Get all reviews for a product          |
| DELETE | `/api/reviews/:id`                | Yes           | —             | Delete a review (only own reviews)     |

### Seller Dashboard

| Method | Endpoint                          | Auth Required | Role Required | Description                            |
|--------|-----------------------------------|---------------|---------------|----------------------------------------|
| GET    | `/api/seller/stats`               | Yes           | SELLER        | Get seller analytics (revenue, orders, ratings) |
| GET    | `/api/seller/products`            | Yes           | SELLER        | Get the seller's products (paginated)  |
| GET    | `/api/seller/orders`              | Yes           | SELLER        | Get the seller's incoming orders       |
| PATCH  | `/api/seller/orders/:id/status`   | Yes           | SELLER        | Update the status of a seller's order  |

### Admin Dashboard

| Method | Endpoint                          | Auth Required | Role Required | Description                            |
|--------|-----------------------------------|---------------|---------------|----------------------------------------|
| GET    | `/api/admin/stats`                | Yes           | ADMIN         | Get system-wide analytics              |
| GET    | `/api/admin/users`                | Yes           | ADMIN         | List all users (searchable, paginated) |
| PATCH  | `/api/admin/users/:id/status`     | Yes           | ADMIN         | Toggle a user's active/inactive status |
| PATCH  | `/api/admin/users/:id/role`       | Yes           | ADMIN         | Change a user's role                   |
| DELETE | `/api/admin/users/:id`            | Yes           | ADMIN         | Permanently delete a user and all associated data |
| GET    | `/api/admin/orders`               | Yes           | ADMIN         | List all orders (filterable, paginated) |

---

*End of Setup Manual. For additional help, report issues at https://github.com/anomalyco/opencode/issues.*
