const express = require('express');
const router = express.Router();
const authController = require('../../controllers/usercontroller/authController');
const passport=require('passport')
const {isAuthenticated,isGuest,noCache, isBlocked}=require('../../middlewares/authmiddlwares')
const shopCtlr=require('../../controllers/usercontroller/shopCtlr')
const {getCart,addToCart,removeFromCart,updateQuantity}=require('../../controllers/usercontroller/CartController')
const {addToWishlist,getWishlist,removeFromwishlist}=require('../../controllers/usercontroller/wishlistController')
const {getCheckout,placeOrder,getSuccessPage,verifyPayment,rePayment,addMoneyToWallet,walletVerifyPayment}=require('../../controllers/usercontroller/checkoutController')
const {getProfile,addAddress,getOrders,requestReturnOrder,returnItem,
    getOrderDetails,cancelOrder,cancelItem,
    editAddress,deleteAddress,editDetails,downloadinvoice,
    changePassword}=require('../../controllers/usercontroller/AddressController')
const {getWallet}= require('../../controllers/usercontroller/WalletController')



router.get('/signup', isGuest,noCache, authController.showSignup);
router.post('/request-otp', isGuest, noCache,authController.requestOtp); // Optional: only if you want to restrict this too
router.post('/verify-otp', isGuest,noCache, authController.verifyOtp); // Optional
router.post('/resendOTP',isGuest,noCache,authController.resendOTP)
router.get('/login', isGuest,noCache, authController.userLogin);
router.post('/login', isGuest, authController.checkDetails);


//forget password
router.get('/forgot-password',authController.getForgetPassword)
router.post('/forget-password',authController.forgetPassword)
router.get('/reset-password/:token',authController.resetPasswordGet)
router.post('/reset-password/:token',authController.resetPassword)
//Home page Rendering
router.get('/',noCache,authController.basic)
router.get('/home',noCache, authController.getHome); 
router.post('/logout', isAuthenticated, authController.logout);

//Products Shop 
router.get('/shop',noCache,isBlocked,shopCtlr.showProducts)
router.get('/product/:id',noCache,isBlocked,shopCtlr.productDetail)


//cart page
router.get('/cart',noCache,isBlocked,isAuthenticated,getCart)
router.post('/cart/add',addToCart)
router.post('/cart/remove',removeFromCart)
router.patch('/cart/update-quantity',updateQuantity)


// Wishlist Page
router.get("/wishlist",noCache,isAuthenticated,getWishlist)
router.post('/wishlist/add',addToWishlist)
router.delete('/wishlist/remove/:id',removeFromwishlist)

//Profile Page Functionality
router.get('/profile',noCache,isAuthenticated,isBlocked,getProfile)
router.post('/address/add_addresses',addAddress)
router.put('/address/edit_address',editAddress)
router.delete('/address/delete/:id',deleteAddress)

//personal details edit
router.patch('/profile/edit',editDetails)

//Change Password
router.post('/profile/changePassword',changePassword)

const test=(req,res,next)=>{
    console.log('testing...')
    next()
}

// orders section
router.get('/orders',noCache,isBlocked,isAuthenticated,getOrders)
router.get('/orders/:id',noCache,isBlocked,isAuthenticated,getOrderDetails)
router.patch('/order/cancel/',cancelOrder)
router.patch('/order/cancel-item',cancelItem)
router.post('/request-return-order',requestReturnOrder)
router.post('/return/item/:itemId',returnItem)

// Download Invoice
router.get('/orders/:orderId/details',noCache,downloadinvoice)

//proceed checkout
router.get('/checkout',noCache,isBlocked,isAuthenticated,getCheckout)
router.post('/placed_order',placeOrder)
router.get('/order/placed/:orderId',noCache,getSuccessPage)


//google
router.get('/auth/google',isGuest,passport.authenticate('google',{
    scope:['profile','email'] 
}))
router.get('/auth/google/callback',passport.authenticate('google',{failureRedirect:'/signup'}),
(req,res)=>{
    req.session.user=req.user._id;
    console.log(req.session.user)
  

    res.redirect('/home')
})


router.post('/order/verify_payment/:id',test,verifyPayment)
router.post('/proceedToPayment',test,rePayment)


// wallet functions.

router.get('/wallet',noCache,isBlocked,isAuthenticated,getWallet)
router.post('/wallet/create-order',test,addMoneyToWallet)
router.post('/wallet/verify-payment',test,walletVerifyPayment)
module.exports = router;
