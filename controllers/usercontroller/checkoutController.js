const Address=require('../../models/AddressModel')
const Product=require('../../models/Products')
const Cart=require("../../models/cartModal")
const Order=require('../../models/OrdersModel')
const Coupon= require('../../models/CouponsModel')
const { randomBytes } = require('crypto');


const getCheckout=async(req,res)=>{
    try{
        console.log("checkout running..")

        const userId=req.session.user
        const addresses=await Address.find({userId:userId})
        const cart=await Cart.findOne({user:userId}).populate('items.product')
       
       
 
        
        const cartTotal=cart.items.reduce((total,item)=>total +(item.product.price*item.quantity),0)
        const deleveryCharge = cartTotal> 500 ? 0 : 40.00 || 0
        const coupons= await Coupon.find({active:true})
        const applicableCoupons = coupons.filter(coupon => cartTotal >= coupon.minPrice);

        if(!cart || cart.items.length===0){
            return res.render('../views/user/checkout', { cartItems: [], cartTotal: 0 ,user:userId,addresses,deleveryCharge,coupons:applicableCoupons});

        }
       
 
        
    res.render("../views/user/checkout",{   
        user:userId,
        cartItems:cart.items,
        cartId:cart._id,
        cartTotal,
        addresses,
        coupons:applicableCoupons,
        deleveryCharge

    })

    }catch(error){
        console.log(error)
    }
   
}

function generateOrderId(length) {
    return randomBytes(length).toString('hex').slice(0, length).toUpperCase(); // Generate a random ID
}

const placeOrder = async (req, res) => {
    try {
        console.log("Order placing function running");
        const userId = req.session.user;
        const cart = await Cart.findOne({ user: userId }).populate('items.product');
        console.log('Cart:', cart);   
        if (!cart || cart.items.length === 0) {
            console.log("Cart is empty");
            return res.json({ success: false, message: "Your cart is empty." });
        }
        const { addressId, paymentMethod , totalPrice , couponCode,couponDiscount,deleveryCharge} = req.body.orderData;
        const address = await Address.findById(addressId);
        console.log(address);
        if (!address) {
            return res.json({ success: false, message: "Address not found!" });
        }
        const subtotal=cart.items.reduce((total,item)=>total +(item.product.price*item.quantity),0)
        // Check and update product stock
        for (const item of cart.items) {
            const product = await Product.findById(item.product._id); // Fetch product from the database
            if (!product) {
                return res.status(404).json({ success: false, message: "Product not found!" });
            }
            if (product.stock < item.quantity) {
                return res.status(400).json({
                    success: false,
                    message: `Insufficient stock for ${product.name}. Available stock: ${product.stock}`
                });
            }
            // Decrease the product stock
            product.stock -= item.quantity;
            await product.save(); // Save the updated product
        }
        // Create the order
        const order = new Order({
            orderId: generateOrderId(10),
            user: userId,
            address: {
                name: address.name,
                phone: address.phone,
                pincode: address.pincode,
                locality: address.locality,
                address: address.address,
                district: address.district,
                landmark: address.landmark,
                addressType: address.addressType
            },
            paymentMethod,
            items: cart.items.map(item => ({
                productId: item.product._id,
                productName: item.product.name,
                productImage: item.product.images[0],
                quantity: item.quantity,
                price: item.product.price
            })),
            status: 'Order placed',
            couponCode:couponCode,
            couponDiscount:couponDiscount.toFixed(2),
            subtotal: subtotal.toFixed(2),
            deleveryCharge: deleveryCharge,

            totalPrice: totalPrice.toFixed(2)
        });

        await order.save();
        await Cart.deleteOne({ user: userId });
        req.session.orderId = order.orderId;
        console.log('Order Id:', req.session.orderId);
        return res.status(201).json({ success: true, message: "Order placed successfully", order });
       

    } catch (error) {
        console.log(error);
        console.error('Error placing order:', error);
        return res.status(500).json({ message: "An error occurred while placing the order." });
    }
};


const getSuccessPage=async (req,res)=>{
    if(req.session.orderId){
        res.render('../views/user/orderSuccess',{
            title:'Order Successful',
            orderId:req.session.orderId
        })

    }else{
        res.redirect('/checkout')
    }
    
}
module.exports={
    getCheckout,
    placeOrder,
    getSuccessPage
}