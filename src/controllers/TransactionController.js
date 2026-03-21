const TransactionModel = require("../models/TransactionModel");

// CREATE TRANSACTION
const createTransaction = async (req, res) => {
  try {
    const transaction = await TransactionModel.create({
      ...req.body,
      buyer_id: req.user._id, // Associate with the logged-in user
    });

    res.status(201).json({ 
      message: "Transaction created successfully", 
      data: transaction 
    });

  } catch (error) {
    res.status(500).json({ 
      message: "Error creating transaction", 
      error: error.message 
    });
  }
};

// GET ALL TRANSACTIONS
const getAllTransactions = async (req, res) => {
  try {
    const transactions = await TransactionModel.find()
      .populate("buyer_id")
      .populate("vehicle_id");

    res.status(200).json({ 
      message: "Transactions fetched successfully", 
      data: transactions 
    });

  } catch (error) {
    res.status(500).json({ 
      message: "Error fetching transactions", 
      error: error.message 
    });
  }
};

// GET TRANSACTION BY ID
const getTransactionById = async (req, res) => {
  try {
    const transaction = await TransactionModel.findById(req.params.id)
      .populate("buyer_id")
      .populate("vehicle_id");

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    res.status(200).json(transaction);

  } catch (error) {
    res.status(500).json({ 
      message: "Error fetching transaction", 
      error: error.message 
    });
  }
};

// GET BUYER TRANSACTIONS
const getBuyerTransactions = async (req, res) => {
  try {
    const transactions = await TransactionModel.find({ buyer_id: req.user._id })
      .populate("vehicle_id");

    res.status(200).json({ 
      message: "Buyer transactions fetched", 
      data: transactions 
    });

  } catch (error) {
    res.status(500).json({ 
      message: "Error fetching buyer transactions", 
      error: error.message 
    });
  }
};

// UPDATE TRANSACTION STATUS
const updateTransactionStatus = async (req, res) => {
  try {
    const updateData = { ...req.body };
    if (req.body.payment_status === "Paid") {
      updateData.payment_date = Date.now();
    }
    const updated = await TransactionModel.findByIdAndUpdate(
      req.params.id, 
      updateData,
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    res.status(200).json({ 
      message: "Transaction updated successfully", 
      data: updated
    });

  } catch (error) {
    res.status(500).json({ 
      message: "Error updating transaction", 
      error: error.message 
    });
  }
};

// DELETE TRANSACTION
const deleteTransaction = async (req, res) => {
  try {
    const deleted = await TransactionModel.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    res.status(200).json({ 
      message: "Transaction deleted successfully", 
      data: deleted 
    });
    
  } catch (error) {
    res.status(500).json({ 
      message: "Error deleting transaction", 
      error: error.message 
    });
  }
};

module.exports = {
  createTransaction,
  getAllTransactions,
  getTransactionById,
  getBuyerTransactions,
  updateTransactionStatus,
  deleteTransaction,
};