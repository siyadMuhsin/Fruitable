const express=require("express")
const router=express.Router()
const path=require("path")
const adminAuth=require('../../controllers/admincontroller/adminAuth')
const {isAuthenticated,isGuest,noCache}=require('../../middlewares/authmiddlwares')
const userCtrl=require('../../controllers/admincontroller/userCtrl')
const category=require('../../controllers/admincontroller/category')
const ProductsCtlr=require('../../controllers/admincontroller/ProductsCtlr')
const {validateCategory,adminAuthenticate}=require("../../middlewares/adminMiddlwares/adminSide")
const winston = require('winston')
const { createProductTalavedhna ,editProduct,removeImage,listProduct,unListProduct} = require("../../controllers/admincontroller/productController")
const {createProductTala}=require('../../controllers/admincontroller/ProductsCtlr')
const multer=require("multer")



const test=(req,res,next)=>{
  console.log('testing')
  next()
  }





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
router.put('/category/edit/:id',test,category.editCategory)










const storage = multer.diskStorage({
  destination:(req,file,cb)=>{
      cb(null, 'uploads/images');  // Directory to store uploaded images
  },
  filename:(req,file,cb)=>{
      cb(null, Date.now() + '-' + file.originalname); // Unique file names
  }
})
// File upload validation (only images)
const fileFilter=(req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
      cb(null, true); // Corrected from cd to cb
  } else {
      cb(new Error('Only image files are allowed'), false);
  }
};
const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
      // Accept only image files
      const fileTypes = /jpeg|jpg|png|gif/;
      const extName = fileTypes.test(path.extname(file.originalname).toLowerCase());
      const mimeType = fileTypes.test(file.mimetype);

      if (extName && mimeType) {
          return cb(null, true);
      } else {
          cb(new Error('Only images are allowed!'));
      }
  }
});

// Middleware for handling image uploads (assuming "croppedImages[]" is the field name)
const uploadMultipleImages = upload.array('croppedImages[]', 10);  // Accept up to 10 images



//Products Routes
router.post('/product/create',uploadMultipleImages,createProductTalavedhna)



router.get('/products',noCache,adminAuthenticate,ProductsCtlr.getProducts)
router.patch('/product/list/:id',test,listProduct)
router.patch('/product/unList/:id',test,unListProduct)
router.post('/product/edit/:id',upload.array('croppedImages[]'),editProduct)
router.post('/product/remove-image',removeImage)


module.exports=router 