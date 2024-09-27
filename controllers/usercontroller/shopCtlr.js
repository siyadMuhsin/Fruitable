const ProducDB=require("../../models/Products")
const CategoryDB=require("../../models/category")

const showProducts= async (req,res)=>{
    const user = req.session.user || false;
    try {
        // Fetch all products from the database
        const products = await ProducDB.find().populate('category');   
        res.render('../views/user/shop',{products, user})
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