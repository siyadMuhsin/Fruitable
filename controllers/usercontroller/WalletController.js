const Wallet= require('../../models/WalletModel')
const User=require('../../models/usermodel');
const { userLogin } = require('./authController');



const getWallet = async (req, res) => {
    console.log('Fetching wallet page...');
    try {
        const userId = req.session.user;
        const user = await User.findById(userId)
        console.log(`User ID: ${userId}`);
        const wallet = await Wallet.findOne({ user: userId }).populate('transactions');
        if (!wallet) {
            const newWallet = new Wallet({ user: userId, balance: 0, transactions: [] });
            await newWallet.save();
            return res.render('../views/user/wallet', { wallet: newWallet, transactions: [] });
        }
        const sortedTransactions = wallet.transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
        res.render('../views/user/walletPage', {
            user,
            wallet: wallet,
            transactions: sortedTransactions 
        });
    } catch (error) {
        console.error('Error fetching wallet page:', error);
        res.status(500).send('Server Error');
    }
};




module.exports= {
    getWallet,
  
}