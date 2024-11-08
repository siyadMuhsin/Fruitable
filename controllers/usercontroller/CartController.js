const Cart=require("../../models/cartModal")
const Product =require("../../models/Products")

// Get Cart Page
const getCart = async (req, res) => {
    const user = req.session.user;

    try {
        const cart = await Cart.findOne({ user: user })
            .populate({
                path: 'items.product',
                populate: {
                    path: 'offer',  
                },
            });

        if (!cart || cart.items.length === 0) {
            return res.render('../views/user/cart', { user, cartItems: [], cartTotal: 0, greatestDiscounts: [] });
        }

        const filteredCartItems = cart.items.filter(item => item.product.isListed);
        
 
        if (filteredCartItems.length < cart.items.length) {
            cart.items = filteredCartItems;
            await cart.save();  // Save the updated cart to the database
        }

        
        const cartData = filteredCartItems.map(item => {
            let itemPrice = item.product.price; // Original price
            let greatestDiscount = 0; // Default discount

            if (item.product.offer && item.product.offer.length > 0) {
              
                const activeOffers = item.product.offer.filter(offer => offer.isActive);

                if (activeOffers.length > 0) {
              
                    greatestDiscount = Math.max(...activeOffers.map(offer => offer.discount));

                
                    const discountedPrice = itemPrice - (itemPrice * (greatestDiscount / 100));
                    itemPrice = discountedPrice;
                }
            }

            return {
                ...item._doc,
                itemPrice,  
                greatestDiscount, 
            };
        });

        const cartTotal = Math.floor(cartData.reduce((total, item) => total + (item.itemPrice * item.quantity), 0));

        const greatestDiscounts = cartData.map(item => item.greatestDiscount);

        // Render the cart page with product details and greatest discounts
        res.render('../views/user/cart', { user, cartItems: cartData, cartTotal, greatestDiscounts });
    } catch (error) {
        console.error('Error fetching cart:', error);
        res.status(500).send('Server Error');
    }
};


//Add to Cart 
const addToCart =async(req,res)=>{
    

    try {
        if(!req.session.user){
            return res.send({success:false ,message:"Please login"})
        }
        const {productId,quantity}=req.body

        const product= await Product.findById(productId).populate('offer')
      
        
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
        
        res.json({ success: true, message: 'Product added to cart', cart });
    } catch (error) {
        console.log(error)
        res.status(500).json({ success: false, message: 'Error adding product to cart' });
    }


}

//remove from cart
const removeFromCart=async(req,res)=>{

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

        const product = await Product.findById(productId).populate('offer'); // Include the offer in the product

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

        // Update the quantity in the cart
        cartItem.quantity = quantity;
        await cart.save();

        // Calculate the price based on offer
        let productPrice = product.price;
        if (product.offer) {
            // If an offer is available, calculate the discounted price
            productPrice = product.price - (product.price * (product.offer.discount / 100));
        }

        // Recalculate cart total with the discounted or original price
        const cartTotal = cart.items.reduce((total, item) => {
            const itemProductPrice = item.product.toString() === productId ? productPrice : item.product.price;
            return total + (item.quantity * itemProductPrice);
        }, 0);

        
        res.json({
            success: true,
            message: 'Cart Updated Successfully',
            cartTotal: cartTotal.toFixed(2),  // Sending total with 2 decimal places
            productPrice: productPrice.toFixed(2) // Send the price with the offer applied
        });
    } catch (error) {
        console.error('Error updating cart quantity:', error);
        res.status(500).json({ success: false, message: 'Failed to update cart' });
    }
};

module.exports={getCart,addToCart,removeFromCart,updateQuantity}