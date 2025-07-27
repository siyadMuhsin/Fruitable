const Coupon = require('../../models/CouponsModel');
const Order = require('../../models/OrdersModel');
const Product = require('../../models/Products');
const Wallet = require("../../models/WalletModel");
const User = require("../../models/usermodel");
const httpStatus = require("../../types/HTTP_STATUS");

const getOrders = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const orders = await Order.find()
            .populate('user')
            .sort({ orderDate: -1 })
            .skip(skip)
            .limit(limit)
            .exec();
        const totalOrders = await Order.countDocuments();
        const totalPages = Math.ceil(totalOrders / limit);

        res.render('../views/admin/orders', {
            orders,
            currentPage: page,
            totalPages,
            limit
        });
    } catch (error) {
        console.log(error);
        res.status(httpStatus.INTERNAL_SERVER_ERROR).send('Server error');
    }
};

const OrderView = async (req, res) => {
    const orderId = req.params.id;
    try {
        const order = await Order.findById(orderId).populate('user').exec();

        if (!order) {
            return res.status(httpStatus.NOT_FOUND).json({ success: false, message: 'Order not found' });
        }

        const nonCancelledItemCount = order.items.filter(item => item.status !== 'Cancelled').length;

        res.render('../views/admin/OrderDetails', { order, nonCancelledItemCount });
    } catch (error) {
        console.error('Error fetching order:', error);
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ success: false, message: 'Server error. Please try again later.' });
    }
};

const statusUpdate = async (req, res) => {
    try {
        const orderId = req.params.id;
        const newStatus = req.body.status;
        const updatedOrder = await Order.findByIdAndUpdate(orderId, { status: newStatus }, { new: true });

        res.json({ success: true, order: updatedOrder });
    } catch (err) {
        console.log(err);
    }
};

// cancel order
const cancelOrder = async (req, res) => {
    try {
        const { orderId } = req.body;
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(httpStatus.NOT_FOUND).json({ success: false, message: 'Order not found.' });
        }
        for (const item of order.items) {
            const product = await Product.findById(item.productId);
            if (!product) {
                return res.status(httpStatus.NOT_FOUND).json({ success: false, message: `Product not found for item ${item.productName}` });
            }

            product.stock += item.quantity;
            await product.save();
        }
        order.status = "Cancelled";
        await order.save();
        return res.json({ success: true, message: 'Order cancelled successfully.' });
    } catch (error) {
        console.error('Error cancelling order:', error);
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ success: false, message: 'Internal server error.' });
    }
};

// Approve return
const approveReturn = async (req, res) => {
    const { orderId } = req.body;
    try {
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(httpStatus.NOT_FOUND).json({ success: false, message: 'Order not found' });
        }

        order.status = 'Return Approved';

        await order.save();
        res.json({ success: true, message: 'Return approved successfully' });
    } catch (error) {
        console.error('Error approving return:', error);
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ success: false, message: 'Server error' });
    }
};

// reject return
const rejectReturn = async (req, res) => {
    const { orderId } = req.body;
    try {
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(httpStatus.NOT_FOUND).json({ success: false, message: 'Order not found' });
        }

        order.status = 'Return Rejected';
        await order.save();
        res.json({ success: true, message: 'Return rejected successfully' });
    } catch (error) {
        console.error('Error rejecting return:', error);
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ success: false, message: 'Server error' });
    }
};

// mark as order returned
const markOrderReturn = async (req, res) => {
    try {
        const { orderId } = req.body;

        const order = await Order.findById(orderId).populate('user');
        if (!order) {
            return res.status(httpStatus.NOT_FOUND).json({ success: false, message: 'Order not found' });
        }

        order.status = "Returned";
        const totalPrice = order.totalPrice;
        const wallet = await Wallet.findOne({ user: order.user._id });
        if (!wallet) {
            return res.status(httpStatus.NOT_FOUND).json({ success: false, message: 'Wallet not found for this user.' });
        }

        wallet.balance += totalPrice;
        wallet.transactions.push({
            amount: totalPrice,
            type: 'credit',
            description: `Refund for Return Order: ${order.orderId}`,
            date: new Date(),
        });

        await wallet.save();
        await order.save();

        res.json({ success: true, message: 'Order status changed to returned and amount refunded to wallet' });
    } catch (error) {
        console.log(error);
        console.error('Error marking order as returned:', error);
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ success: false, message: 'An error occurred while processing the return.' });
    }
};

// Each item return function
const returnitem = async (req, res) => {
    const itemId = req.params.itemId;

    try {
        const order = await Order.findOne({ "items._id": itemId }).populate('user');
        if (!order) {
            return res.status(httpStatus.NOT_FOUND).json({ success: false, message: 'Order not found!' });
        }

        const item = order.items.id(itemId);
        if (!item) {
            return res.status(httpStatus.NOT_FOUND).json({ success: false, message: 'Item not found in the order!' });
        }

        item.status = 'Returned';

        const coupon = await Coupon.find({ code: order.couponCode });

        let discount = 0;
        if (coupon.length !== 0) {
            discount = coupon[0].discount;
        }

        const returnAmount = (item.price * item.quantity) - (item.price * item.quantity) * discount / 100;

        const productId = item.productId;
        const product = await Product.findById(productId);
        if (product) {
            product.stock += item.quantity;
            await product.save();
        } else {
            return res.status(httpStatus.NOT_FOUND).json({ success: false, message: 'Product not found!' });
        }

        const userId = order.user._id;
        const wallet = await Wallet.findOne({ user: userId });
        if (!wallet) {
            return res.status(httpStatus.NOT_FOUND).json({ success: false, message: 'User not found' });
        }

        wallet.balance += Math.floor(returnAmount);
        wallet.transactions.push({
            amount: Math.floor(returnAmount),
            type: 'credit',
            description: `Refund for Return Item: ${item.productName} from Order ${order.orderId}`,
            date: new Date(),
        });
        await wallet.save();
        await order.save();
        return res.json({ success: true, message: 'Item returned successfully!' });
    } catch (error) {
        console.error('Error processing return:', error);
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ success: false, message: 'An error occurred while processing the return.' });
    }
};

// reject return each items
const rejectReturnItem = async (req, res) => {
    const itemId = req.params.itemId;

    try {
        const order = await Order.findOne({ "items._id": itemId }).populate('user');
        if (!order) {
            return res.status(httpStatus.NOT_FOUND).json({ success: false, message: 'Order not found!' });
        }

        const item = order.items.id(itemId);
        if (!item) {
            return res.status(httpStatus.NOT_FOUND).json({ success: false, message: 'Item not found in the order!' });
        }

        item.status = 'Return Rejected';

        await order.save();

        return res.json({ success: true, message: 'Return request rejected successfully!' });
    } catch (error) {
        console.error('Error rejecting return:', error);
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ success: false, message: 'An error occurred while rejecting the return request.' });
    }
};

module.exports = {
    getOrders,
    OrderView,
    statusUpdate,
    cancelOrder,
    approveReturn,
    rejectReturn,
    markOrderReturn,
    returnitem,
    rejectReturnItem
};
