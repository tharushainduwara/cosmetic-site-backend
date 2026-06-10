# Cosmetic Site Backend 💄✨

This is the backend server for the Cosmetic Site, built using the **MERN** stack (specifically Node.js, Express, and MongoDB). It provides the RESTful API endpoints to manage products, users, orders, and authentication.

## 🚀 Features

- **User Authentication:** Secure Signup and Login using JWT (JSON Web Tokens).
- **Product Management:** CRUD operations for cosmetic products (Add, Edit, Delete, View).
- **Category Filtering:** Fetch products based on specific beauty categories.
- **Order Management:** Process and store customer orders.
- **Middleware:** Custom error handling and authentication protection for private routes.
- **Database:** MongoDB integration via Mongoose for flexible data modeling.

## 🛠️ Tech Stack

- **Runtime Environment:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB (with Mongoose ODM)
- **Authentication:** JWT & bcryptjs
- **Environment Variables:** dotenv
- **Validation:** Express-validator (or your preferred tool)

- [Node.js](https://nodejs.org/) (v14 or higher)
- [MongoDB](https://www.mongodb.com/) (Local or Atlas)
- [Git](https://git-scm.com/)


## 🛣️ API Endpoints
- POST,/api/auth/register,Register a new user
- POST,/api/auth/login,Login user & get token
- GET,/api/products,Get all cosmetic products
- GET,/api/products/:id,Get a specific product
- POST,/api/products,Add a new product (Admin)
- POST,/api/orders,Create a new order


## 📄 License
Distributed under the MIT License. See LICENSE for more information.

Developed by Tharusha Induwara
