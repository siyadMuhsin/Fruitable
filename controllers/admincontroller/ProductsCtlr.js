const { error, Console } = require("console")
const ProducDB=require("../../models/Products")
const CategoryDB=require("../../models/category")
const multer=require("multer")
const path=require("path")
const { console } = require("inspector")




const getProducts=async (req,res)=>{
    
    const categories= await CategoryDB.find()
    const products = await ProducDB.find().populate('category'); // Populating the category

    res.render('../views/admin/products',{products,categories})  
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



module.exports={
    getProducts,
    // createProductTala,
    listProduct,
    unListProduct,
    // editProduct
}