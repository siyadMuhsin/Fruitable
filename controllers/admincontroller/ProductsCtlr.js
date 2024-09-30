const { error, Console } = require("console")
const ProducDB=require("../../models/Products")
const CategoryDB=require("../../models/category")
const multer=require("multer")
const path=require("path")
const { console } = require("inspector")


// Multer configuration
// const storage = multer.diskStorage({
//     destination:(req,file,cb)=>{
//         cb(null, 'uploads/images');  // Directory to store uploaded images
//     },
//     filename:(req,file,cb)=>{
//         cb(null, Date.now() + '-' + file.originalname); // Unique file names
//     }
// })




// // File upload validation (only images)
// const fileFilter=(req, file, cb) => {
//     if (file.mimetype.startsWith('image')) {
//         cb(null, true); // Corrected from cd to cb
//     } else {
//         cb(new Error('Only image files are allowed'), false);
//     }
// };

// const upload = multer({
//     storage:storage,
//     fileFilter:fileFilter,
//     limits:{ fileSize: 1024 * 1024 * 5 }  // 5MB size limit
// }).fields([{ name: 'images', maxCount: 5 }])// Change to allow an array of images


const getProducts=async (req,res)=>{
    console.log('fswdfwfdwefdwtfjdhfuowefo;uwrfbusr')
    const categories= await CategoryDB.find()
    const products = await ProducDB.find().populate('category'); // Populating the category

    res.render('../views/admin/products',{products,categories})  
}

// const createProductTala =async(req, res) => {
//     console.log('Files:', req.files)
    
//     console.log("Received a request to create a product");
//     console.log("Request Body:"); // Log the request body to see the data sent
//     //  logger.info("kake kake kood evude")
//     try {
//         // Add your product creation logic here
//         console.log("Product creation logic executed");
        
//         return res.status(200).json({ ok: true, msg: "ProducTsfdsfdsdfst created successfully" });
//     } catch (error) {
//         console.error('Error:', error);
//         return res.status(500).json({ ok: false, msg: 'Internal Server Error' });
//     }
// };


// const createProduct= (req,res)=>{

//     try {
//         res.json({y44uyu:'ujtrj'})
//     console.log("he;\llo")
//     // res.json({success:"success from inside"})
   
//     console.log('gooi')

//     // upload(req,res, async(error)=>{      
//     //     if(error){
//     //         console.log(error)
//     //         return res.status(400).send(error.message);       
//     //     }
       

        
           
//     //         const { name, category, price, stock, description } = req.body;
//     //         console.log(req.body)
//     //         const images = req.files.map(file => file.filename);
//     //         const exisName= await ProducDB.findOne({name})
//     //         if(exisName){
//     //             console.log('Product Name Already Added')
//     //             return res.send(`
//     //                 <html>
//     //      <body>
//     //          <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
//     //          <script>
//     //              Swal.fire({
//     //                  icon: 'error',
//     //                  title: 'Oops...',
//     //                  text: 'Product Name already used!',
//     //                  confirmButtonText: 'OK'
//     //              }).then((result) => {
//     //                  if (result.isConfirmed) {
//     //                      window.location.href = "/admin/products"; 
//     //                  }
//     //              });
//     //          </script>
//     //      </body>
//     //  </html>
//     //              `);

//     //         }else{

//     //             // Store all uploaded images in an array
              
//     //             const newProduct =new ProducDB({
//     //                 name,
//     //                 category,
//     //                 price,
//     //                 stock,
//     //                 description,
//     //                 images // Save the array of image filenames
//     //             });
                    
//     //         console.log("saved")
//     //             await newProduct.save()
//     //             res.json({ success: true, message: 'Product created successfully!' });

//     //         }


            
            
//     //     })
//     } catch (error) {
//         console.error('Error creating product:', error);
//         res.status(500).json({ success: false, message: 'Error creating product' });
//     }
// }
const listProduct=async(req,res)=>{
    try {
        const {id}=req.params
        await ProducDB.findByIdAndUpdate(id,{isListed:true})
        res.redirect('/admin/products')
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Failed to list the product.' });   
    }  
}

const unListProduct=async(req,res)=>{
    try {
        const { id } = req.params;
        await ProducDB.findByIdAndUpdate(id, { isListed: false });
        // Respond with JSON indicating success
       res.redirect('/admin/products')
    } catch (error) {
        // Handle any errors
        console.error(error);       
        res.status(500).json({ success: false, message: 'Failed to unlist the product.' });
    }
}


// const editProduct=async (req,res)=>{
//     console.log('edit products')
//     return res.json({message:"pooooda"})
//     try {
//         upload(req,res, async(error)=>{
           
//             if(error){
//                 console.log(error)
//                 return res.status(400).send(error.message);    
    
//             }
//             const {id, name, category, price, stock, description, status } = req.body;
//             const product= await ProducDB.findById(id)
//             if(!product){
//                 return res.status(404).json({
//                     success:false,
//                     message:'Products Not found Find not id!',
//                     red:'/admin/products'

//                 });
//             }
//            product.name=name,
//            product.category=category,
//            product.price=price,
//            product.stock=stock,
//            product.description=description,
//            product.status=status
            
//            if(req.files){
//             console.log("alavu",req.files.length)
//             const images = req.files['images'] ? req.files['images'].map(file => file.filename) : [];
//             console.log('req.files',req.files)
//             console.log('Images',images)
//             product.images = product.images || [];
//             // Push new images to the images array
         
//            }
//            await product.save()
//            res.redirect('/admin/products')
//         })
        
//     } catch (error) {
//         res.status(500).send('Server Error');
        
//     }
    
// }
module.exports={
    getProducts,
    // createProductTala,
    listProduct,
    unListProduct,
    // editProduct
}