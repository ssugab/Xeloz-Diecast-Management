const express = require('express');
const app = express();

const productRoutes = require('./routes/productRoutes');

// agar express bisa membaca JSON
app.use(express.json())

// routes
app.use("/api/products", productRoutes)



module.exports = app