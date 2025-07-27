const { error, Console } = require("console")
const ProducDB=require("../../models/Products")
const CategoryDB=require("../../models/category")
const multer=require("multer")
const path=require("path")
const { console } = require("inspector")
const httpStatus=require('../../types/HTTP_STATUS')




const getProducts=async (req,res)=>{

    const page= parseInt(req.query.page)||1
    const limit=8
    const skip= (page -1)* limit
   try {
    
    const trotalProducts= await ProducDB.countDocuments()
    const totalPages=Math.ceil(trotalProducts/limit)
    const products= await ProducDB.find()
    .populate('category')
    .skip(skip)
    .limit(limit)

    res.render('../views/admin/products',{
        products,
        categories,
        currentPage:page,
        totalPages
    })
    
   } catch (error) {
    console.log(error)
    res.status(httpStatus.INTERNAL_SERVER_ERROR).send(error);
    
   }
     
}

const listProduct=async(req,res)=>{
    try {
        const {id}=req.params
        await ProducDB.findByIdAndUpdate(id,{isListed:true})
        res.redirect('/admin/products')
    } catch (error) {
        console.error(error);
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ success: false, message: 'Failed to list the product.' });   
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
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ success: false, message: 'Failed to unlist the product.' });
    }
}



module.exports={
    getProducts,
    // createProductTala,
    listProduct,
    unListProduct,
    // editProduct
}