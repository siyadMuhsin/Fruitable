const Address=require('../../models/AddressModel')
const Product=require('../../models/Products')
const Cart=require("../../models/cartModal")
const Order=require('../../models/OrdersModel')
const Coupon= require('../../models/CouponsModel')
const User= require("../../models/usermodel")
const Wallet=require('../../models/WalletModel')
const { randomBytes } = require('crypto');

const Razorpay= require('razorpay')
const KeyId=process.env.KEY_ID
const SecretKey= process.env.SECRET_KEY

const razorpayInstance = new Razorpay({
    key_id: KeyId, 
    key_secret: SecretKey 
});

const getCheckout = async (req, res) => {
    try {
        
        const userId = req.session.user;
        const addresses = await Address.find({ userId: userId });
        const cart = await Cart.findOne({ user: userId })
            .populate({
                path: 'items.product',
                populate: {
                    path: 'offer', 
                },
            });
        let cartTotal = 0;
        let deliveryCharge = 0;

        if (!cart || cart.items.length === 0) {
            return res.render('../views/user/checkout', {
                cartItems: [],
                cartTotal: 0,
                user: userId,
                addresses,
                deleveryCharge:deliveryCharge,
                greatestDiscounts: [], 
                coupons: []
            });
        }
        const cartItemsWithDiscounts = cart.items.map(item => {
            let itemPrice = item.product.price; // Original price
            let greatestDiscount = 0; // Default discount

            if (item.product.offer && item.product.offer.length > 0) {
                const activeOffers = item.product.offer.filter(offer => offer.isActive);

                if (activeOffers.length > 0) {
                    greatestDiscount = Math.max(...activeOffers.map(offer => offer.discount));
                    itemPrice -= (itemPrice * (greatestDiscount / 100));
                }
            }
            return {
                ...item._doc,
                itemPrice, 
                greatestDiscount 
            };
        });
        cartTotal = Math.floor(cartItemsWithDiscounts.reduce((total, item) => total + (item.itemPrice * item.quantity), 0));
        deliveryCharge = cartTotal > 500 ? 0 : 40.00;
        const coupons = await Coupon.find({ active: true });
        const applicableCoupons = coupons.filter(coupon => cartTotal >= coupon.minPrice);
        res.render("../views/user/checkout", {
            user: userId,
            cartItems: cartItemsWithDiscounts, 
            cartId: cart._id,    
            cartTotal,           
            addresses,           
            coupons: applicableCoupons, // Pass applicable coupons
            deleveryCharge: deliveryCharge, // Delivery charge
            greatestDiscounts: cartItemsWithDiscounts.map(item => item.greatestDiscount) // Pass greatest discounts
        });
    } catch (error) {
        console.error('Error fetching checkout details:', error);
        res.status(500).send('Server Error');
    }
};
function generateOrderId(length) {
    return randomBytes(length).toString('hex').slice(0, length).toUpperCase(); // Generate a random ID
}

const placeOrder = async (req, res) => {
    try {
        
        const userId = req.session.user;
        const user = await User.findById(userId);
        const cart = await Cart.findOne({ user: userId }).populate('items.product'); 

        if (!cart || cart.items.length === 0) {
            return res.json({ success: false, message: "Your cart is empty." });
        }

        const { addressId, paymentMethod, totalPrice, couponCode, couponDiscount, deleveryCharge } = req.body.orderData;
        const address = await Address.findById(addressId);

        if (!address) {
            return res.json({ success: false, message: "Address not found!" });
        }

        const wallet = await Wallet.findOne({ user: userId });
        if (!wallet) {
            return res.status(400).json({ success: false, message: "Wallet not found" });
        }

        if (paymentMethod === 'Wallet') {
            
            if (wallet.balance < totalPrice) {
                return res.json({ success: false, message: "Insufficient wallet balance Check your Wallet" });
            }
        }

        const subtotal = cart.items.reduce((total, item) => total + (item.product.price * item.quantity), 0);
       
        for (const item of cart.items) {
            const product = await Product.findById(item.product._id).populate('offer');
            if (!product) {
                return res.status(404).json({ success: false, message: "Product not found!" });
            }
            if (product.stock < item.quantity) {
                return res.status(400).json({
                    success: false,
                    message: `Insufficient stock for ${product.name}. Available stock: ${product.stock}`
                });
            }   

            // Calculate the greatest discount percentage
            let greatestDiscount = 0;
            if (product.offer && product.offer.length > 0) {
                const activeOffers = product.offer.filter(offer => offer.isActive);
                if (activeOffers.length > 0) {
                    greatestDiscount = Math.max(...activeOffers.map(offer => offer.discount));
                }
            }

            // Update the product stock
            product.stock -= item.quantity;
            await product.save(); 

            // If needed, you can save the greatest discount to the order item price calculation.
            item.discountedPrice = product.price - (product.price * (greatestDiscount / 100)); // Calculate discounted price
        }

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
               
                price: Math.floor(item.discountedPrice)|| item.product.price // Use discounted price if available
            })),
            status: paymentMethod === 'Razorpay' ? "Pending" : "Order placed",
            couponCode,
            couponDiscount: couponDiscount.toFixed(2),
            subtotal: subtotal.toFixed(2),
            deleveryCharge,
            totalPrice: totalPrice.toFixed(2)
        });

        await order.save();
        await Cart.deleteOne({ user: userId });
        const order_id = order._id;
        
        req.session.orderId = order.orderId;

        if (paymentMethod === 'Wallet') {
            wallet.balance -= totalPrice;  
            wallet.transactions.push({
                amount: totalPrice,
                type: 'debit',
                description: `Order payment for Order ${order.orderId}`, 
                date: new Date(),
            });
            await wallet.save();
        } 

        if (paymentMethod === 'Razorpay') {
            const options = {
                amount: totalPrice * 100,
                currency: 'INR',
                receipt: `order_rcptid_${Date.now()}`,
                payment_capture: 1,
            };
            const razorpayOrder = await razorpayInstance.orders.create(options);        
            return res.json({         
                razorpayOrderId: razorpayOrder.id,
                amount: options.amount,
                currency: options.currency,
                orderId: order_id, 
                user: user,
                message: "Razorpay order created successfully. Proceed to payment."
            });
        }

        return res.status(201).json({ success: true, message: "Order placed successfully", order });
    } catch (error) {
        console.log(error);
        console.error('Error placing order:', error);
        return res.status(500).json({ message: "An error occurred while placing the order." });
    }
};


const getSuccessPage=async (req,res)=>{
    const {orderId}=req.params
   
        res.render('../views/user/orderSuccess',{
            title:'Order Successful',
            orderId:req.session.orderId || orderId
        })

}
    

const crypto = require('crypto');

const verifyPayment = async (req, res) => {
    
    const orderId=req.params.id

    const order= await Order.findById(orderId)

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

   

    const hmac = crypto.createHmac('sha256', SecretKey);
    hmac.update(razorpay_order_id + '|' + razorpay_payment_id);
    const generated_signature = hmac.digest('hex');
    if (generated_signature === razorpay_signature) {
        order.status='Order placed'
        order.save()
       
        return res.json({ success: true, message: 'Payment verified successfully!' ,orderId:order.orderId});
    } else {
        return res.json({ success: false, message: 'Payment verification failed.' });
    }
};
const rePayment = async (req, res) => {
    try {
        
        const { orderId } = req.body; 
      
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found!" });
        }

      
        if (order.status !== "Pending") {
            return res.status(400).json({ success: false, message: "Order is not eligible for payment retry." });
        }

        
        const options = {
            amount: order.totalPrice * 100,
            currency: 'INR',
            receipt: `retry_order_rcptid_${Date.now()}`, 
            payment_capture: 1,
        };

        const razorpayOrder = await razorpayInstance.orders.create(options);
        return res.json({
            success:true,
            razorpayOrderId: razorpayOrder.id,
            amount: options.amount,
            orderId,
            currency: options.currency,
            message: "New Razorpay order created for repayment. Proceed to payment."
        });

    } catch (error) {
        console.error('Error retrying payment:', error);
        return res.status(500).json({ message: "An error occurred while retrying the payment." });
    }
};
const addMoneyToWallet = async (req, res) => {
   
    const { amount } = req.body; // Amount in paise (e.g., ₹100 = 10000 paise)

    try {

        const order = await razorpayInstance.orders.create({
            amount,
            currency: 'INR',
            receipt: `wallet_topup_${Date.now()}`
        });

        res.json({ success: true, orderId: order.id, amount: order.amount ,KeyId});
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: 'Failed to create order' });
    }
};
const walletVerifyPayment= async(req,res)=>{
    const { orderId, paymentId, signature } = req.body;
    const generatedSignature = crypto
        .createHmac('sha256', SecretKey)
        .update(orderId + '|' + paymentId)
        .digest('hex');

    if (generatedSignature === signature) {
       
        try {
            const userId = req.session.user; 
           
            const wallet = await Wallet.findOne({ user:userId });

            
            if (!wallet) {
                return res.json({ success: false, message: 'Wallet not found' });
            }

            let addAmount=parseFloat(req.body.amount) / 100
            wallet.balance +=addAmount ;
            wallet.transactions.push({
                amount: addAmount,
                type: 'credit',
                description: `Add Money From Razorpay ${addAmount}`, 
                date: new Date(),
            });
            await wallet.save();

            res.json({ success: true, message: 'Payment verified and wallet balance updated' });
        } catch (error) {
            console.error(error);
            res.json({ success: false, message: 'Server error' });
        }
    } else {
        res.json({ success: false, message: 'Payment verification failed' });
    }
}
module.exports={
    getCheckout,
    placeOrder,
    getSuccessPage,
    verifyPayment,
    rePayment,
    addMoneyToWallet,
    walletVerifyPayment
}