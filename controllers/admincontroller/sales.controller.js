const Order= require('../../models/orders.model')
const Products= require('../../models/Products.model')
const httpStatus=require('../../types/HTTP_STATUS')



async function getBestSellingProducts() {
    const bestSellingProducts = await Order.aggregate([
        { $match: { status: "Delivered" } }, 
        { $unwind: "$items" }, 
        {
            $group: {
                _id: "$items.productId", 
                totalSold: { $sum: "$items.quantity" }, 
                productName: { $first: "$items.productName" }, 
                productImage: { $first: "$items.productImage" } 
            }
        },
        { $sort: { totalSold: -1 } }, 
        { $limit: 10 } 
    ]);
    return bestSellingProducts;
}
async function getBestSellingCategories() {
    const bestSellingCategories = await Order.aggregate([
        { $match: { status: "Delivered" } }, 
        { $unwind: "$items" },
        {
            $lookup: {
                from: "products", 
                let: { productId: { $toObjectId: "$items.productId" } },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $eq: ["$_id", "$$productId"] 
                            }
                        }
                    },
                    {
                        $lookup: {
                            from: "categories", 
                            localField: "category", 
                            foreignField: "_id", 
                            as: "categoryDetails" 
                        }
                    },
                    { $unwind: "$categoryDetails" } 
                ],
                as: "productDetails"
            }
        },
        { $unwind: "$productDetails" },
        {
            $group: {
                _id: "$productDetails.categoryDetails.name", 
                totalSold: { $sum: "$items.quantity" } 
            }
        },
        { $sort: { totalSold: -1 } }, 
        { $limit: 10 } 
    ]);
    return bestSellingCategories;
}

const salesReport = async (req, res) => {
    
    const bestSellingProducts = await getBestSellingProducts();
    const bestSellingCategories = await getBestSellingCategories();
    const filter = req.query.filter || 'all'; 
    const { startDate, endDate } = req.query;

    try {
        let query = { status: 'Delivered' }; 
        if (filter === 'daily') {
            const today = new Date();
            query.orderDate = {
                $gte: new Date(today.setHours(0, 0, 0, 0)), 
                $lt: new Date(today.setHours(23, 59, 59, 999)) 
            };
        } else if (filter === 'weekly') {
            const lastWeek = new Date();
            lastWeek.setDate(lastWeek.getDate() - 7); 
            query.orderDate = { $gte: lastWeek };
        } else if (filter === 'monthly') {
            const lastMonth = new Date();
            lastMonth.setMonth(lastMonth.getMonth() - 1); 
            query.orderDate = { $gte: lastMonth };
        } else if (filter === 'yearly') {
            const startOfYear = new Date(new Date().getFullYear(), 0, 1);
            query.orderDate = { $gte: startOfYear };
        } else if (filter === 'custom') {
            if (startDate && endDate) {
                query.orderDate = { $gte: new Date(startDate), $lte: new Date(endDate) };
            }
        }
        const orders = await Order.find(query).populate('user').sort({ orderDate: -1 });
        const totalSalesAmount = orders.reduce((total, order) => {
            const discount = order.couponDiscount || 0;
            const finalPrice = order.totalPrice - discount;
            return total + finalPrice;
        }, 0);
        const totalOfferDiscountAmount = orders.reduce((total, order) => {
            if (order.subtotal >= 500) {
                return total + (order.subtotal - order.totalPrice);
            } else {
                return total + (order.subtotal + 40 - order.totalPrice);
            }
        }, 0);
        const totalDiscountAmount = orders.reduce((a, c) => a + (c.couponDiscount || 0), 0);
        const reportData = orders.filter(order => order.status === "Delivered").map(order => {
            const itemsCount = order.items.reduce((total, item) => total + item.quantity, 0);

            let offer = 0
            if(order.subtotal >= 500){
               
                offer=order.subtotal - order.totalPrice 
            }else{
               
                offer = order.couponDiscount ===0 ? order.subtotal + 40 - order.totalPrice : order.subtotal + 40 - order.couponDiscount  -order.totalPrice
               
            }
            // order.subtotal >= 500 ? order.subtotal - order.totalPrice : order.subtotal + 40 - order.totalPrice;
            
            return {
                orderId: order.orderId,
                clientName: order.user.username,
                orderDate: order.orderDate.toLocaleDateString(),
                itemsCount,
                totalAmount: order.subtotal,
                offerPrice: offer,
                couponDiscount: order.couponDiscount || 0,
                deliveryCharge:order.deleveryCharge,
                finalPrice: order.totalPrice ,
                paymentMethod: order.paymentMethod,
                status: order.status
            };
        });
        const totalOrderCount= reportData.length
        const filteredSalesData = orders.map(order => ({
            date: order.orderDate.toLocaleDateString(),
            finalPrice: order.totalPrice 
        }));
        res.render('../views/admin/dashboard', {
            reportData,
            totalSalesAmount,
            totalOfferDiscountAmount,                                                  
            totalDiscountAmount, 
            totalOrderCount,        
            reportFilter: filter,
            startDate, 
            endDate,
            bestSellingProducts,
            bestSellingCategories,
            filteredSalesData 
        });
    } catch (error) {
        console.error('Error generating sales report:', error);
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ success: false, message: 'Server error' });
    }
};
module.exports={
    salesReport,
    
}