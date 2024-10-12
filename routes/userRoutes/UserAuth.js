const express = require('express');
const router = express.Router();
const authController = require('../../controllers/usercontroller/authController');
const passport=require('passport')
const {isAuthenticated,isGuest,noCache, isBlocked}=require('../../middlewares/authmiddlwares')
const shopCtlr=require('../../controllers/usercontroller/shopCtlr')
const {getCart,addToCart,removeFromCart,updateQuantity}=require('../../controllers/usercontroller/CartController')
const {addToWishlist,getWishlist,removeFromwishlist}=require('../../controllers/usercontroller/wishlistController')
const {getCheckout,placeOrder,getSuccessPage}=require('../../controllers/usercontroller/checkoutController')
const {getProfile,addAddress,getOrders,
    getOrderDetails,cancelOrder,
    editAddress,deleteAddress,editDetails,
    changePassword}=require('../../controllers/usercontroller/AddressController')




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
router.get('/',authController.basic)
router.get('/home',noCache, authController.getHome); 
router.post('/logout', isAuthenticated, authController.logout);

//Products Shop 
router.get('/shop',isBlocked,shopCtlr.showProducts)
router.get('/product/:id',isBlocked,shopCtlr.productDetail)


//cart page
router.get('/cart',isBlocked,getCart)
router.post('/cart/add',addToCart)
router.post('/cart/remove',removeFromCart)
router.patch('/cart/update-quantity',updateQuantity)


// Wishlist Page
router.get("/wishlist",isAuthenticated,isBlocked,getWishlist)
router.post('/wishlist/add',addToWishlist)
router.delete('/wishlist/remove/:id',removeFromwishlist)

//Profile Page Functionality
router.get('/profile',isAuthenticated,isBlocked,getProfile)
router.post('/address/add_addresses',addAddress)
router.put('/address/edit_address',editAddress)
router.post('/address/add',deleteAddress)

//personal details edit
router.patch('/profile/edit',editDetails)

//Change Password
router.post('/profile/changePassword',changePassword)



// orders section
router.get('/orders',isAuthenticated,getOrders)
router.get('/orders/:id',isAuthenticated,getOrderDetails)
router.patch('/order/cancel/',cancelOrder)

//proceed checkout
router.get('/checkout',isAuthenticated,noCache,getCheckout)
router.post('/placed_order',placeOrder)
router.get('/order/placed',isAuthenticated,noCache,getSuccessPage)


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




module.exports = router;
