const Address=require('../../models/AddressModel')
const User=require('../../models/usermodel')
const Product=require('../../models/Products')
const Order=require('../../models/OrdersModel')
const bcrypt = require('bcrypt'); 
const Wallet= require('../../models/WalletModel')

const getProfile= async (req,res)=>{
    const user=req.session.user
    const userDetails=await User.findById(user)
    const orders=await Order.find({user:user}).sort({ orderDate: -1 }).lean(); 
    const wallet =await Wallet.findOne({user:user}).populate('transactions')
    const sortedTransactions = wallet.transactions.sort((a, b) => b.date - a.date);

    const addresses = await Address.find({userId:user})
    res.render('../views/user/profile',{user,addresses,userDetails,orders,wallet:wallet,transactions: sortedTransactions})

}
const addAddress=async(req,res)=>{
    console.log('address adding running..')
    try {
        const { name, phone, alt_phone, pincode, locality, landmark, district, state, country, address, addressType } = req.body;
        
          // Validate input
    if (!name || !phone || !pincode || !locality || !district || !state || !country || !address || !addressType) {
        return res.status(400).json({ success: false, message: 'All fields are required.' });
    }
        // Assuming req.user holds the authenticated user's information
    const userId = req.session.user;

    // Create the address object
    const newAddress = new Address({
        userId,
        name,
        phone,
        pincode,
        locality,
        landmark,
        district,
        state,
        country,
        address,
        addressType
      });

       // Save the address to the database
    await newAddress.save();

    // Return success response
    res.json({ success: true, message: 'Address added successfully!' });



    } catch (error) {
        console.error('Error adding address:', error);
        res.status(500).json({ success: false, message: 'Server error. Please try again later.' });
        
    }
   
}

const editAddress=async (req,res)=>{
    console.log(req.body)
   
        const {  addressId, editName, editPhone,  editAddress, editLocality, editDistrict, editPincode, editState, editCountry } = req.body;
        try { 
         // Update address in the database
         const updatedAddress = await Address.findByIdAndUpdate(addressId, {
            name:editName,
            phone:editPhone,
            address:editAddress,
            locality:editLocality,
            district:editDistrict,
            pincode:editPincode,
            state:editState,
            country:editCountry
        })
        console.log('heloi',updatedAddress)

        if (updatedAddress) {
            return res.json({ success: true, message: 'Address updated successfully!' });
        } else {
            return res.status(404).json({ success: false, message: 'Address not found.' });
        }
        
     


    } catch (error) {

        console.error('Error updating address:', error);
        return res.status(500).json({ success: false, message: 'Server error. Please try again later.' });
        
    }
}

//delete Addresses
const deleteAddress= async(req,res)=>{
    console.log('delete function running')

    try {
        const addressId=req.params.id
       // Find the address by ID and delete it
       const deletedAddress = await Address.findByIdAndDelete(addressId);
       if(deletedAddress){
        return res.json({success:true,message:'Address deleted successfully'})
       }else{
        return res.status(404).json({success:false,message:'Address not found.'})
       }
    } catch (error) {
        console.error('Error deleting address:', error);
        return res.status(500).json({ success: false, message: 'Server error. Please try again later.' });
        
    }
}

// edit profile details
const editDetails= async (req,res)=>{
    try {
        console.log("edit profile running", req.body);

        const userId = req.session.user;

        const updatedDetails = {
            username: req.body.username,
            phone: req.body.phone
        };

        // Use async/await to update the user's details in the database
        const updatedUser = await User.findByIdAndUpdate(userId, updatedDetails, { new: true });

        // If the update is successful, send a response with the updated user
        res.status(200).json({ message: 'Details updated successfully', user: updatedUser });
    } catch (err) {
        // Handle errors with a try-catch block
        console.error('Error updating user details:', err);
        res.status(500).json({ message: 'Error updating user details' });
    }
}

// Change Password
const changePassword = async (req, res) => {
    console.log("Change Password");
    try {
        const userId = req.session.user;
        const { currentPassword, newPassword } = req.body;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        if(!user.password){
            console.log("google user")
            return res.status(404).json({ success: false, message: "Its Google user  you cant change password" });
        }

       
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            console.log('Current password does not match');
            return res.status(401).json({ success: false, message: 'Current password is incorrect' });
        }

      
        if (newPassword === currentPassword) {
            return res.status(400).json({ success: false, message: 'New password must be different from current password' });
        }

        // Hash the new password
        const hashedNewPassword = await bcrypt.hash(newPassword, 10);
        console.log(hashedNewPassword)


        // Update the user's password
        user.password = hashedNewPassword;
        await user.save();

        return res.status(200).json({ success: true, message: 'Password changed successfully!' });
    } catch (error) {
        console.error('Error changing password:', error);
        return res.status(500).json({ success: false, message: 'Internal server error. Please try again.' });
    }
};
    
// get orders
const getOrders= async (req,res)=>{
    const user=req.session.user
    const orders=await Order.find({user:user}).sort({ orderDate: -1 }).lean(); 
    res.render('../views/user/orders',{user,orders})
}

const getOrderDetails=async(req,res)=>{
    
    console.log(req.params.id)
    try {
        const user =req.session.user
        const order_Id=req.params.id
        const order = await Order.findById(order_Id).populate('items.productId')
        console.log(order)

        if(!order){
            return res.status(404).send('Order not Found')
        }
        res.render('../views/user/orderDetails',{order,user})

    } catch (error) {
        console.error(error);
        res.status(500).send('Servvdagvr gh dtshbeter Error');
        
    }
}



//cancel orderss
const cancelOrder = async (req, res) => {
    console.log('Cancel order process started...');
    try {
        const { orderId } = req.body;
        const order = await Order.findById(orderId).populate('user');

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }
        if (order.status === 'Cancelled') {
            return res.status(400).json({ success: false, message: 'Order is already cancelled' });
        }
        for (const item of order.items) {
            const product = await Product.findById(item.productId);
            if (!product) {
                return res.status(404).json({ success: false, message: `Product not found for item ${item.productName}` });
            }
            product.stock += item.quantity;
            await product.save(); 
        }
        order.status = "Cancelled";
        await order.save();
        if (order.paymentMethod !== 'Cash on Delivery') {
            console.log("Non-COD order detected, refunding to wallet...");
            let wallet = await Wallet.findOne({ user: order.user._id });

            if (!wallet) {
                wallet = new Wallet({
                    user: order.user._id,
                    balance: order.totalPrice, 
                    transactions: [{
                        amount: order.totalPrice,
                        type: 'credit',
                        description: `Refund for cancelled order ${order.orderId}`,
                        date: new Date(),
                    }]
                });
            } else {
                wallet.balance += order.totalPrice;
                wallet.transactions.push({
                    amount: order.totalPrice,
                    type: 'credit',
                    description: `Refund for cancelled order ${order.orderId}`,
                    date: new Date(),
                });
            }
            await wallet.save();
        }

        return res.json({ success: true, message: 'Order cancelled and refunded successfully!' });

    } catch (error) {
        console.error('Error cancelling order:', error);
        return res.status(500).json({ success: false, message: 'Server error. Please try again later.' });
    }
};

const cancelItem=async(req,res)=>{
    console.log('cancel item id:',req.body)
    try {
        const {itemId}=req.body

        const order= await Order.findOne({'items._id':itemId}).populate('user')
        if(!order){
            return res.status(404).json({success:false,message:'Item not found in any order'})
        }
        const item= order.items.id(itemId)
        if (!item) {
            return res.status(404).json({ success: false, message: 'Item not found' });
        }

        if (item.status === 'Cancelled') {
            return res.status(400).json({ success: false, message: 'Item already cancelled' });
        }

        const product=await Product.findById(item.productId)
        if(!product){
            return res.status(404).json({ success: false, message: 'Product not found for item' });
        }

        product.stock +=item.quantity;
        await product.save()

        item.status='Cancelled';

        const cancelledItemSubtotal = item.price * item.quantity

        order.totalPrice -= cancelledItemSubtotal 
        order.subtotal -= cancelledItemSubtotal

        const allCancelled= order.items.every(i => i.status=== 'Cancelled')
        if(allCancelled){
            order.status = 'Cancelled'

        }
        await order.save()
        if (order.paymentMethod !== 'Cash on Delivery') {
            const wallet = await Wallet.findOne({user:order.user._id})
            if (!wallet) {
                return res.status(404).json({ success: false, message: 'Wallet not found' });
            }

           

            // Add the cancelled amount to the wallet
            wallet.balance += cancelledItemSubtotal;

            // Record the transaction in the wallet's transaction history
            wallet.transactions.push({
                amount: cancelledItemSubtotal,
                type: 'credit',
                description: `Refund for cancelled item from Order ${order.orderId}`,
                date: new Date(),
            });

            await wallet.save(); // Save wallet changes
        }
        return res.json({ success: true, message: 'Item cancelled successfully!' });


    } catch (error) {
        console.log(error)
        console.error('Error cancelling item:', error);
        return res.status(500).json({ success: false, message: 'Server error. Please try again later.' });
        
    }
}


const getWallet= async (req,res)=>{
    console.log("wallet page getting...")

}


// return order function..
const requestReturnOrder= async(req,res)=>{
    const { orderId, reason } = req.body;
    try {
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        order.status = 'Return Requested';
        order.returnReason = reason; // Assuming you have a returnReason field in your Order model
        await order.save();

        res.json({ success: true, message: 'Return request submitted successfully' });
    } catch (error) {
        console.log(error)
        console.error('Error processing return request:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
}
// item return 
const returnItem = async(req,res)=>{

    const itemId = req.params.itemId;
    try {
      
        const order = await Order.findOne({ "items._id": itemId });

        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found." });
        }
        const item = order.items.id(itemId);
        if (!item) {
            return res.status(404).json({ success: false, message: "Item not found in the order." });
        }

        item.status = 'Return Requested';
     

        await order.save();

        return res.status(200).json({ success: true, message: "Item returned successfully." });
    } catch (error) {
        console.error('Error returning item:', error);
        return res.status(500).json({ success: false, message: "An error occurred while processing the return." });
    }
}

// Download Invoice
const downloadinvoice= async(req,res)=>{
    console.log("download invoice is running")
    const orderId = req.params.orderId;

    try {
        const order = await Order.findById(orderId).populate('items.productId user'); // Populate product and user
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        return res.json({ success: true, order });
    } catch (error) {
        console.error('Error fetching order:', error);
        return res.status(500).json({ success: false, message: 'Error fetching order details' });
    }
}
module.exports={
    getProfile,
    addAddress,
    editAddress,
    deleteAddress,
    editDetails,
    changePassword,
    getOrders,
    getOrderDetails,
    cancelOrder,
    cancelItem,
    requestReturnOrder,
    returnItem,
    downloadinvoice
   
}