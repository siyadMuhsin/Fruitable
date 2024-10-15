const express=require("express")
const router=express.Router()
const adminAuth=require('../../controllers/admincontroller/adminAuth')
const {isAuthenticated,isGuest,noCache}=require('../../middlewares/authmiddlwares')
const userCtrl=require('../../controllers/admincontroller/userCtrl')
const category=require('../../controllers/admincontroller/category')
const {validateCategory,adminAuthenticate}=require("../../middlewares/adminMiddlwares/adminSide")
const { createProduct ,editProduct,removeImage,listProduct,unListProduct,getProducts} = require("../../controllers/admincontroller/productController")
const {createProductTala}=require('../../controllers/admincontroller/ProductsCtlr')
const {getOrders,OrderView ,statusUpdate,cancelOrder}=require('../../controllers/admincontroller/orderController')
const uploadMultipleImages=require('../../controllers/admincontroller/multer')
const {getCoupons,createCoupon,updateCoupon,couponStatus}=require('../../controllers/admincontroller/CouponsCTRL')


//Login Authentication
router.get('/',noCache,adminAuth.adminGet)
router.post('/login',noCache,adminAuth.admincheck)
router.post('/logout',adminAuth.adminLogout)

//Dashboard
router.get('/dashboard',noCache,adminAuth.getDashboard)

//Users List
router.get('/users',noCache,adminAuthenticate,userCtrl.getUsers)
router.patch('/users/block/:id',userCtrl.blockUser)
router.patch('/users/unblock/:id',userCtrl.unblockUser)


//Categories routes
router.get('/category',noCache,adminAuthenticate,category.getCategories)
router.post('/addCategory',validateCategory,category.createCategory)
router.patch('/category/list/:id',category.listCategory)
router.patch('/category/unList/:id',category.unListCategory)
router.put('/category/edit/:id',category.editCategory)


// order controller
router.get('/orders',adminAuthenticate,getOrders)
router.get('/order/view/:id',adminAuthenticate,OrderView)
router.post('/order/updateStatus/:id',statusUpdate)
router.patch('/order/cancel',cancelOrder)


//Products Routes
router.post('/product/create',uploadMultipleImages,createProduct)
router.get('/products',noCache,adminAuthenticate,getProducts)
router.patch('/product/list/:id',listProduct)
router.patch('/product/unList/:id',unListProduct)
router.post('/product/edit/:id',uploadMultipleImages,editProduct)
router.post('/product/remove-image',removeImage)

// coupons Routes
router.get('/coupons',adminAuthenticate,getCoupons)
router.post('/coupons/create',createCoupon)
router.put('/coupons/update/:id',updateCoupon)
router.patch('/coupons/status/:id',couponStatus)


module.exports=router 