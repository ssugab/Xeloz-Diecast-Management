
const products = require("../data/items")
const transactions = require("../data/transactions")

const getTransactions = (req, res) => {
  res.json(transactions);
}

const getTransactionsById = (req, res) => {
  const id = parseInt(req.params.id);
  const transaction = transactions.find(t => t.id === id);
  if (!transaction) {
    return res.status(404).json({ message: "Transaction not found" });
  }
  res.json(transaction);
}

const addTransaction = (req, res) => {
  const { productId, soldPrice, quantity, platform } = req.body;
  
}

const deleteTransaction = (req, res) => {}

const getTransactionSummary = (req, res) => {}

module.exports = {
  getTransactions,
  getTransactionsById,
  addTransaction,
  deleteTransaction,
  getTransactionSummary
}