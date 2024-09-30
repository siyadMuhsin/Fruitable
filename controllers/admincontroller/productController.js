const ProductDB=require("../../models/Products")

const createProductTalavedhna = async(req, res) => {

    try{

    const id=req.params.id
              const { name, category, price, stock, description } = req.body;
            console.log(req.body)
            const imageFiles = req.files.map(file => file.filename); 
            console.log('Imgaea fileeeees:',imageFiles)
            const exisName= await ProductDB.findOne({name})
            if(exisName){
                console.log('Product Name Already Added')
                return res.status(400).json({
                    success:false,
                    message:'Products  Name already used !',
                    red:'/admin/products'
                   })
   
 
            }else{

                // Store all uploaded images in an array
              
                const newProduct =new ProductDB({
                    name,
                    category,
                    price,
                    stock,
                    description,
                    images:imageFiles // Save the array of image filenames
                });
                    
            console.log("saved")
                await newProduct.save()
                res.json({ success: true, message: 'Product created successfully!' ,red: "/admin/products"});

            }

        } catch (error) {
            console.error('Error creating product:', error);
            res.status(500).json({ success: false, message: 'Error creating product' });
        }

         
    
    }
//edit products

const editProduct=async (req,res)=>{
       
      
        try {
           
               console.log(req.files)
               
                const {id, name, category, price, stock, description, status } = req.body;
                console.log(req.body)
                
                const product= await ProductDB.findById(id)
                if(!product){
                    return res.status(404).json({
                        success:false,
                        message:'Products Not found Find not id!',
                        red:'/admin/products'
    
                    });
                }
               product.name=name,
               product.category=category,
               product.price=price,
               product.stock=stock,
               product.description=description,
               product.status=status


               
               console.log('req.files:',req.files)
               if (req.files && req.files.length > 0) {
                const uploadedImages = req.files.map(file => file.filename);
                product.images.push(...uploadedImages);
            }
            
               await product.save()
               return res.status(200).json({
                success:true,
                message:'Product updated Successfully',
                red:'/admin/products'
               })
               
            
            
        }catch(err){

        }
    
    }

    const removeImage=async(req,res)=>{
        try{
        const {imageName,productId}=req.body
 
       await ProductDB.findOneAndUpdate(
         {_id:productId},
         {$pull:{images:imageName}},// Remove the image from the images array
         {new:true}
        )
        console.log('Image removed successfully')
       return res.status(200).json({success:true,msg:'Image removed successfully'});

        }catch(err){
            console.error('Error updating database:', err);
            return res.status(500).send('Error updating database');
        }
}
         

const listProduct=async(req,res)=>{
    try {
        console.log('list product')
        const {id}=req.params
       const product=await ProductDB.findByIdAndUpdate(id,{isListed:true},{new:true})
       if(!product){
        return res.status(404).json({ message: 'Product not found' });
       }
       res.json({ message: 'Product has been listed successfully!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to list the product' });  
    }  
}

const unListProduct=async(req,res)=>{
    try {
        console.log('unlist Product')
        const { id } = req.params;
       const product= await ProductDB.findByIdAndUpdate(id, { isListed: false },{new:true});
       if(!product){
        return res.status(404).json({ message: 'Product not found' });
       }
       // Respond with JSON indicating success
       res.json({ message: 'Product has been unlisted successfully!' });
    } catch (error) {
        // Handle any errors
        console.error(error);       
        res.status(500).json({ success: false, message: 'Failed to unlist the product.' });
    }
}

    

// Export the function in CommonJS style
module.exports = { createProductTalavedhna ,editProduct,removeImage,listProduct,unListProduct};
