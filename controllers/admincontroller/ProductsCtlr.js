const { error } = require("console")
const ProducDB=require("../../models/Products")
const CategoryDB=require("../../models/category")
const multer=require("multer")
const path=require("path")


// Multer configuration
const storage = multer.diskStorage({
    destination:(req,file,cb)=>{
        cb(null, 'uploads/images');  // Directory to store uploaded images
    },
    filename:(req,file,cb)=>{
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
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
    storage:storage,
    fileFilter:fileFilter,
    limits:{ fileSize: 1024 * 1024 * 5 }  // 5MB size limit
}).fields([
    { name: 'image1', maxCount: 1 },
    { name: 'image2', maxCount: 1 },
    { name: 'image3', maxCount: 1 }
])


const getProducts=async (req,res)=>{
    const categories= await CategoryDB.find()
    const products = await ProducDB.find().populate('category'); // Populating the category
    res.render('../views/admin/products',{products,categories})  
}

const createProduct=(req,res)=>{
    upload(req,res, async(error)=>{      
        if(error){
            console.log(error)
            return res.status(400).send(error.message);       
        }
        const { name, category, price, stock, description } = req.body;

        
        try {
            const exisName= await ProducDB.findOne({name})
            if(exisName){
                console.log('Product Name Already Added')
                return res.send(`
                    <html>
         <body>
             <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
             <script>
                 Swal.fire({
                     icon: 'error',
                     title: 'Oops...',
                     text: 'Product Name already used!',
                     confirmButtonText: 'OK'
                 }).then((result) => {
                     if (result.isConfirmed) {
                         window.location.href = "/admin/products"; 
                     }
                 });
             </script>
         </body>
     </html>
                 `);

            }else{
                const newProduct =new ProducDB({
                    name,
                    category,
                    price,
                    stock,
                    description,
                    image1: req.files['image1'] ? req.files['image1'][0].filename : null,
                    image2: req.files['image2'] ? req.files['image2'][0].filename : null,
                    image3: req.files['image3'] ? req.files['image3'][0].filename : null,
                })
                await newProduct.save()
                res.redirect('/admin/products')

            }


            
            
        } catch (error) {
            console.error(error);
            res.status(500).send('Server Error');        
        }
    })
}
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


const editProduct=async (req,res)=>{
    try {
        upload(req,res, async(error)=>{
           
            if(error){
                console.log(error)
                return res.status(400).send(error.message);    
    
            }
            const {id, name, category, price, stock, description, status } = req.body;
            const product= await ProducDB.findById(id)
            if(!product){
                return res.status(404).send('Product not found');
            }
           product.name=name,
           product.category=category,
           product.price=price,
           product.stock=stock,
           product.description=description,
           product.status=status
            
           if(req.files){
            product.image1 = req.files.image1 ? req.files.image1.name : product.image1;
            product.image2 = req.files.image2 ? req.files.image2.name : product.image2;
            product.image3 = req.files.image3 ? req.files.image3.name : product.image3;
           }
           await product.save()
           res.redirect('/admin/products')
        })
        
    } catch (error) {
        res.status(500).send('Server Error');
        
    }
    
}
module.exports={
    getProducts,
    createProduct,
    listProduct,
    unListProduct,
    editProduct
}