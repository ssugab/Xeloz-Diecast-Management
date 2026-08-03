const express = require('express');
const router = express.Router();

const { getAllProducts, getProductById, addProduct, getProductsFiltered, updateProducts, deleteProducts } = require('../controllers/productsController.js');

// Products
router.get("/", getAllProducts);
router.get("/filter", getProductsFiltered);
router.get("/:id", getProductById);

router.post("/", addProduct);

router.put("/:id", updateProducts);
router.delete("/:id", deleteProducts);

// Transactions


module.exports = router