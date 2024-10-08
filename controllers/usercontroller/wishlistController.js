const Cart=require("../../models/cartModal")
const Product =require("../../models/Products")
const Wishlist=require("../../models/wishlistModal")

//get Wishlist
const getWishlist=async (req,res)=>{
    console.log("getting wishlist")
    try {
        const user=req.session.user
        const wishlist = await Wishlist.findOne({user:req.session.user}).populate('items.product')// Assuming `items.product` is a reference to the Product model

const wishlistItems=wishlist.items
        if(!wishlist){
           console.log("onnulla")
        }
        res.render('../views/User/wishlist',{wishlist,user,wishlistItems})
        
    } catch (error) {
        console.log(error)
        
    }


}

//add to wishlist
const addToWishlist=async(req,res)=>{
    console.log('add to wishlist function running')
    try {
        const userId=req.session.user
        const {productId}=req.body
         // Find the user's wishlist or create one if it doesn't exist
         let wishlist =await Wishlist.findOne({user:userId})
         if(!wishlist){
            wishlist= new Wishlist({user:userId,items:[]})
         }

          // Check if the product is already in the wishlist
        const productExists = wishlist.items.some(item => item.product.toString() === productId);

        if(!productExists){
            //Add the product to the wishlist
            wishlist.items.push({product:productId})
            await wishlist.save()

            res.json({success:true,message:"Product added to wishlist"})

        }else{
            res.json({success:false,message:'Product is already in your wishlist'})

        }


        
    } catch (error) {
        console.error('Error adding to wishlist:', error);
        res.status(500).json({ success: false, message: 'Failed to add product to wishlist' });
        
    }
}

//remove from wishlist
const removeFromwishlist=async (req,res)=>{
    const userId=req.session.user
    const productId=req.params.id
    
try {
     // find the users wishlist 
     const wishlist = await Wishlist.findOne({user:userId})

     const itemIndex=wishlist.items.findIndex((item)=>item.product.toString()===productId)
     if(itemIndex >-1){
         wishlist.items.splice(itemIndex,1)
         await wishlist.save()
         res.json({ success: true, message: 'Product removed from wishlist' });
     }else{
         res.status(404).json({success:false,nessage:'Product Not Found in wishlist'})
     }
    
} catch (error) {
    console.error('Error removing product from wishlist:', error);
    res.status(500).json({ success: false, message: 'Failed to remove product from wishlist' });
    
}
   

}

module.exports={
    getWishlist,
    addToWishlist,
    removeFromwishlist
}