const express = require('express');
const router = express.Router();
const authController = require('../../controllers/usercontroller/authController');
const passport=require('passport')
const {isAuthenticated,isGuest,noCache}=require('../../middlewares/authmiddlwares')
const shopCtlr=require('../../controllers/usercontroller/shopCtlr')

const { route } = require('moongose/routes');
//User Authentication (Signup,login and google authentication)
router.get('/signup', isGuest,noCache, authController.showSignup);
router.post('/request-otp', isGuest, noCache,authController.requestOtp); // Optional: only if you want to restrict this too
router.post('/verify-otp', isGuest,noCache, authController.verifyOtp); // Optional
router.post('/resendOTP',isGuest,noCache,authController.resendOTP)
router.get('/login', isGuest,noCache, authController.userLogin);
router.post('/login', isGuest, authController.checkDetails);


//Home page Rendering
router.get('/',authController.basic)
router.get('/home',noCache, authController.getHome); 
router.post('/logout', isAuthenticated, authController.logout);

//Products Shop 
router.get('/shop',shopCtlr.showProducts)
router.get('/product/:id',shopCtlr.productDetail)









// Initiate Google OAuth for sign-up
router.get('/auth/google',isGuest,passport.authenticate('google',{
    scope:['profile','email']  // Requesting profile and email from Google
}))

// Callback route after successful authentication
router.get('/auth/google/callback',passport.authenticate('google',{failureRedirect:'/signup'}),
(req,res)=>{
    req.session.user=true;
    // Successful authentication, redirect to home or profile
    console.log('hommeme')
    res.redirect('/home')
})




module.exports = router;
