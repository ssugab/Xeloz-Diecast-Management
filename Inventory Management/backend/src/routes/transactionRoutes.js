const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');

// Route untuk transaksi
router.post('/', transactionController.createTransaction);
router.get('/', transactionController.getAllTransactions);

module.exports = router;
