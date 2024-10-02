const ProducDB=require("../../models/Products")
const CategoryDB=require("../../models/category")

const showProducts= async (req,res)=>{
    const user = req.session.user || false;
    try {
        // Fetch all products from the database
        const products = await ProducDB.find({isListed:true}).populate('category');  
        const categories = await CategoryDB.aggregate([
            {
                $match:{
                    isListed:true  // Only include categories that are listed
                }
            },
            {
                $lookup: {
                    from: 'products', // The collection to join (products)
                    localField: '_id', // The local field (category id)
                    foreignField: 'category', // The foreign field in products
                    as: 'products', // Alias for the joined products
                }
            },
            {
                $addFields: {
                    productCount: { $size: "$products" } // Add the productCount field with the size of the products array
                }
            },
            {
                $project: {
                    name: 1, // Keep the category name
                    productCount: 1 // Keep the productCount
                }
            }
        ]);






        res.render('../views/user/shop',{products, user,categories})
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');      
    }  
}




const productDetail=async (req,res)=>{
    const user = req.session.user || false;

    const productId=req.params.id
    try {
        const product=await ProducDB.findById(productId).populate('category');
        
        if(!product){
            return res.status(404).send('Product not found');
        }
        res.render('../views/user/shop-detail',{product,user})    
    } catch (error) {
        console.log(error)    
    }
}


module.exports={
    showProducts,
    productDetail
}