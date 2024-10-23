const Wallet= require('../../models/WalletModel')
const User=require('../../models/usermodel');
const { userLogin } = require('./authController');



const getWallet = async (req, res) => {
    console.log('Fetching wallet page...');
    try {
        const userId = req.session.user;
        console.log(`User ID: ${userId}`);

        // Find the user's wallet and populate the transactions
        const wallet = await Wallet.findOne({ user: userId }).populate('transactions');

        if (!wallet) {
            // If wallet doesn't exist, create one for the user
            const newWallet = new Wallet({ user: userId, balance: 0, transactions: [] });
            await newWallet.save();
            return res.render('../views/user/wallet', { wallet: newWallet, transactions: [] });
        }

        // Sort the transactions by date in descending order
        const sortedTransactions = wallet.transactions.sort((a, b) => new Date(b.date) - new Date(a.date));

        // Render the wallet page with wallet details and sorted transaction history
        res.render('../views/user/walletPage', {
            wallet: wallet,
            transactions: sortedTransactions // Pass the sorted transactions to the view
        });

    } catch (error) {
        console.error('Error fetching wallet page:', error);
        res.status(500).send('Server Error');
    }
};
module.exports= {
    getWallet
}