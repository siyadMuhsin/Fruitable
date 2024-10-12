const Order=require('../../models/OrdersModel')
const Product=require('../../models/Products')
const getOrders= async(req,res)=>{
    console.log('order Page rundering')
    const orders=await Order.find().populate('user').sort({ orderDate: -1 }).exec()
   
    res.render('../views/admin/orders',{orders})
}


const OrderView= async(req,res)=>{
    const orderId= req.params.id 
    const order= await Order.findById(orderId).populate('user').exec()
    console.log(order)
    console.log('oreder view page rendering')
    res.render('../views/admin/OrderDetails',{order})
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