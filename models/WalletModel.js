const mongoose = require('mongoose');
const User = require('../models/usermodel');

const transactionSchema = new mongoose.Schema({
    amount: {
        type: Number,
        required: true,
    },
    type: {
        type: String,
        enum: ['credit', 'debit'], 
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
        default: Date.now,
    }
});

const walletSchema = new mongoose.Schema({
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',  // Reference to the User model
        required: true 
    },
    balance: { 
        type: Number, 
        default: 0 // Default balance starts at 0
    },
    transactions: [transactionSchema]  // Use the transactionSchema for transactions
});

// Create the Wallet model
const Wallet = mongoose.model('Wallet', walletSchema);

module.exports = Wallet;
