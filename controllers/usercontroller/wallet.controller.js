const Wallet= require('../../models/wallet.model')
const User=require('../../models/user.model');
const { userLogin } = require('./auth.controller');
const httpStatus=require('../../types/HTTP_STATUS')


const getWallet = async (req, res) => {
   
    try {
        const userId = req.session.user;
        const user = await User.findById(userId)
        
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
        res.status(httpStatus.INTERNAL_SERVER_ERROR).send('Server Error');
    }
};




module.exports= {
    getWallet,
  
}