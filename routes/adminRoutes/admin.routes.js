const express=require("express")
const router=express.Router()
const adminAuth=require('../../controllers/admincontroller/auth.controller')
const {isAuthenticated,isGuest,noCache}=require('../../middlewares/auth.middlewares')
const userCtrl=require('../../controllers/admincontroller/user.controller')
const category=require('../../controllers/admincontroller/category.controller')
const {validateCategory,adminAuthenticate}=require("../../middlewares/adminMiddlwares/adminSide")
const { createProduct ,editProduct,removeImage,listProduct,unListProduct,getProducts} = require("../../controllers/admincontroller/product.controller")
// const {createProductTala}=require('../../controllers/admincontroller/products.controller')
const {getOrders,OrderView ,statusUpdate,
    cancelOrder,approveReturn,rejectReturn,
    markOrderReturn,returnitem,rejectReturnItem}=require('../../controllers/admincontroller/order.controller')
const uploadMultipleImages=require('../../controllers/admincontroller/multer.controller')
const {getCoupons,createCoupon,updateCoupon,couponStatus}=require('../../controllers/admincontroller/coupon.controller')
const {getOfferPage,createOffer,updateOffer,activateOffer ,deactivateOffer}= require('../../controllers/admincontroller/offer.controller')

const {salesReport}= require('../../controllers/admincontroller/sales.controller')


//Login Authentication
router.get('/',noCache,adminAuth.adminGet)
router.post('/login',noCache,adminAuth.admincheck)
router.post('/logout',adminAuth.adminLogout)

//Dashboard
// router.get('/dashboard',noCache,adminAuth.getDashboard)

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
router.get('/orders',noCache,adminAuthenticate,getOrders)
router.get('/order/view/:id',adminAuthenticate,OrderView)
router.post('/order/updateStatus/:id',statusUpdate)
router.patch('/order/cancel',cancelOrder)
router.post('/approve-return',approveReturn)
router.post('/reject-return',rejectReturn)
router.post('/mark_order_returned',markOrderReturn)
// Each item return 
router.post('/approve/returnItem/:itemId',returnitem)
router.post('/reject/returnItem/:itemId',rejectReturnItem)


//Products Routes
router.post('/product/create',uploadMultipleImages,createProduct)
router.get('/products',noCache,adminAuthenticate,getProducts)
router.patch('/product/list/:id',listProduct)
router.patch('/product/unList/:id',unListProduct)
router.post('/product/edit/:id',uploadMultipleImages,editProduct)
router.post('/product/remove-image',removeImage)

// coupons Routes
router.get('/coupons',noCache,adminAuthenticate,getCoupons)
router.post('/coupons/create',createCoupon)
router.put('/coupons/update/:id',updateCoupon)
router.patch('/coupons/status/:id',couponStatus)


// Offers Routes
router.get('/offers',noCache,adminAuthenticate,getOfferPage)
router.post('/offers/create',createOffer)
router.put('/offers/update/',updateOffer)
router.patch('/offers/action/:id',activateOffer)
router.put('/offers/ac/:id',deactivateOffer)


router.get('/sales-report',noCache,adminAuthenticate,salesReport)
// router.get('/sales-report',salesReportGet)
module.exports=router