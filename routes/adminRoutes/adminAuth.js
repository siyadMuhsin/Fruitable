const express=require("express")
const router=express.Router()
const adminAuth=require('../../controllers/admincontroller/adminAuth')
const {isAuthenticated,isGuest,noCache}=require('../../middlewares/authmiddlwares')
const userCtrl=require('../../controllers/admincontroller/userCtrl')
const category=require('../../controllers/admincontroller/category')
const ProductsCtlr=require('../../controllers/admincontroller/ProductsCtlr')
const {validateCategory,adminAuthenticate}=require("../../middlewares/adminMiddlwares/adminSide")


//Login Authentication
router.get('/',noCache,adminAuth.adminGet)
router.post('/login',noCache,adminAuth.admincheck)
router.post('/logout',adminAuth.adminLogout)

//Dashboard
router.get('/dashboard',noCache,adminAuth.getDashboard)

//Users List
router.get('/users',noCache,adminAuthenticate,userCtrl.getUsers)
router.post('/users/block/:id',userCtrl.blockUser)
router.post('/users/unblock/:id',userCtrl.unblockUser)


//Categories routes
router.get('/category',noCache,adminAuthenticate,category.getCategories)
router.post('/addCategory',validateCategory,category.createCategory)
router.post('/category/list/:id',category.listCategory)
router.post('/category/unList/:id',category.unListCategory)
router.post('/category/edit/',category.editCategory)

//Products Routes
router.get('/products',noCache,adminAuthenticate,ProductsCtlr.getProducts)
router.post('/product/create',ProductsCtlr.createProduct)
router.post('/product/list/:id',ProductsCtlr.listProduct)
router.post('/product/unList/:id',ProductsCtlr.unListProduct)
router.post('/product/edit',ProductsCtlr.editProduct)



module.exports=router