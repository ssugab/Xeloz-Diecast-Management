const express = require('express');
const cors = require('cors');
const app = express();

const productRoutes = require('./routes/productRoutes');
const transactionRoutes = require('./routes/transactionRoutes');

// Middleware
app.use(cors());
app.use(express.json());

// routes
app.use("/api/products", productRoutes)
app.use("/api/transactions", transactionRoutes)



module.exports = app