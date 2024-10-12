const Cart=require("../../models/cartModal")
const Product =require("../../models/Products")

// Get Cart Page
const getCart=async(req,res)=>{

    const user=req.session.user 

    const cart = await Cart.findOne({user:user}).populate('items.product')
    if(!cart || cart.items.length===0){
        return res.render('../views/user/cart', {user, cartItems: [], cartTotal: 0 });

    }
    cartItems=cart.items

    // Calculate the cart total
    const cartTotal = cart.items.reduce((total, item) => total + item.product.price * item.quantity, 0);
res.render('../views/user/cart',{ user,  cartItems, cartTotal })
}


//Add to Cart 
const addToCart =async(req,res)=>{
    console.log('add To Cart running...')

    try {
        const {productId,quantity}=req.body

        const product= await Product.findById(productId)
      
        
        if(!product){
            return res.status(404).json({success:false,message:'Product not Found'});

        }
       
        let cart =await Cart.findOne({user:req.session.user||req.session.GooggleId})
       

        if(!cart){
            cart=new Cart({
                user:req.session.user||req.session.GooggleId,
                items:[],
                totalAmount:0
            })
        }

        // Check if product is already in the cart
        const cartItemIndex = cart.items.findIndex(item => item.product.toString() === productId);
         // Update quantity if product exists in the cart, else add the product
         if(cartItemIndex >-1){
           return res.json({ success: false, message: 'Product already added to cart Check Cart', cart });

         }else{
            cart.items.push({product:productId,quantity:1})

         }

         cart.totalPrice+=product.price
         await cart.save()
        console.log(cart)
        res.json({ success: true, message: 'Product added to cart', cart });
    } catch (error) {
        console.log(error)
        res.status(500).json({ success: false, message: 'Error adding product to cart' });
    }


}

//remove from cart
const removeFromCart=async(req,res)=>{
console.log("remove function runningg ")
try {
    const userId=req.session.user
    const {productId}=req.body

    //Find the users cart
    const cart= await Cart.findOne({user:userId})
    if(!cart){
        return res.json({success:false,message:'Cart not Found'})
    }
  
    // Remove the product from the cart
    cart.items = cart.items.filter((item)=>{
        if(item.product.toString() !== productId){
            return item
        }
    })
    await cart.save()
    res.json({success:true,message:'Item removed from cart'})

} catch (error) {
    console.error('Error removing item from cart:', error);
    res.json({ success: false, message: 'Internal server error' });
    
}

}

// update cart quantity
const updateQuantity = async (req, res) => {
    console.log("Cart update running");
    const { productId, quantity } = req.body;

    try {
        // Find the cart by user ID or session
        const cart = await Cart.findOne({ user: req.session.user });

        if (!cart) {
            return res.status(404).json({ success: false, message: 'Cart not found' });
        }

        // Find the cart item
        const cartItem = cart.items.find(item => item.product.toString() === productId);

        if (!cartItem) {
            return res.status(404).json({ success: false, message: 'Product not found in cart' });
        }
        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }
        const maxQuantity = product.stock;
        if (quantity > maxQuantity) {
            return res.json({
                success: false,
                message: `You cannot add more than ${maxQuantity} items. Available stock: ${product.stock}`
            });
        }

        cartItem.quantity = quantity;

        await cart.save();

        // Recalculate cart total
        const cartTotal = cart.items.reduce((total, item) => {
            return total + (item.quantity * product.price); // Use the product price you retrieved
        }, 0);

        res.json({
            success: true,
            message: 'Cart Updated Successfully',
            cartTotal: cartTotal,
            productPrice: product.price // Send product price in the response
        });
    } catch (error) {
        console.error('Error updating cart quantity:', error);
        res.status(500).json({ success: false, message: 'Failed to update cart' });
    }
};

module.exports={getCart,addToCart,removeFromCart,updateQuantity}