const Address=require('../../models/AddressModel')
const User=require('../../models/usermodel')
const Product=require('../../models/Products')
const Order=require('../../models/OrdersModel')
const bcrypt = require('bcrypt'); 
const getProfile= async (req,res)=>{
    const user=req.session.user
    const userDetails=await User.findById(user)
    const orders=await Order.find({user:user}).sort({ orderDate: -1 }).lean(); 


    const addresses = await Address.find({userId:user})
    res.render('../views/user/profile',{user,addresses,userDetails,orders})

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
const cancelOrder=async (req,res)=>{
    console.log('cancel running')
    try {
        const {orderId}=req.body
        const order= await Order.findById(orderId)

        if(!order){
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        for (const item of order.items) {
            const product = await Product.findById(item.productId);
            if (!product) {
                return res.status(404).json({ success: false, message: `Product not found for item ${item.productName}` });
            }

            // Add the quantity back to the product's stock
            product.stock += item.quantity;
            await product.save(); // Save updated product stock
        }
        
        order.status="Cancelled"
        await order.save()
        return res.json({ success: true, message: 'Order cancelled successfully!' });
    } catch (error) {
        console.error('Error cancelling order:', error);
        return res.status(500).json({ success: false, message: 'Server error. Please try again later.' });
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
    cancelOrder
}