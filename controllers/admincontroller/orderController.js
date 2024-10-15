const Order=require('../../models/OrdersModel')
const Product=require('../../models/Products')
const getOrders= async(req,res)=>{
    try {
        const page = parseInt(req.query.page)||1
        const limit=parseInt(req.query.limit)||6
        const skip=(page-1)*limit;
        const orders= await Order.find()
            .populate('user')
            .sort({orderDate:-1})
            .skip(skip)
            .limit(limit)
            .exec();
        const totalOrders=await Order.countDocuments()
        const totalPages= Math.ceil(totalOrders/limit)

        res.render('../views/admin/orders',{
            orders,
            currentPage:page,
            totalPages,
            limit
        })
        
    } catch (error) {
        console.log(error);
        res.status(500).send('Server error');
        
    }

}


const OrderView= async(req,res)=>{
    const orderId= req.params.id 
    try {
        const order = await Order.findById(orderId).populate('user').exec();

        if(!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        const nonCancelledItemCount = order.items.filter(item => item.status !== 'Cancelled').length;

        console.log(order);
        console.log('Order view page rendering');
        res.render('../views/admin/OrderDetails', { order, nonCancelledItemCount });
    } catch (error) {
        console.error('Error fetching order:', error);
        res.status(500).json({ success: false, message: 'Server error. Please try again later.' });
    }
}

const statusUpdate= async (req,res)=>{
    console.log("status changing ...")
    const orderId= req.params.id
    const newStatus= req.body.status
   const updatedOrder= await Order.findByIdAndUpdate(orderId,{status:newStatus},{new:true})
    
    

    res.json({ success: true, order: updatedOrder });

}

//cancel order 
const cancelOrder= async(req,res)=>{
    console.log("cancel order running")
    try {
        const {orderId}=req.body
        const order= await Order.findById(orderId)
        if(!order){
            return res.status(404).json({ success: false, message: 'Order not found.' });

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
        return res.json({ success: true, message: 'Order cancelled successfully.' });
    } catch (error) {
        console.error('Error cancelling order:', error);
        return res.status(500).json({ success: false, message: 'Internal server error.' });
        
    }
}
module.exports={
    getOrders,
    OrderView,
    statusUpdate,
    cancelOrder
}