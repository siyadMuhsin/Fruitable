const Cart = require("../../models/cart.model");
const Product = require("../../models/Products.model");
const httpStatus = require("../../types/HTTP_STATUS"); // optional but recommended

// 📋 Get Cart Page
const getCart = async (req, res) => {
    const user = req.session.user;

    try {
        const cart = await Cart.findOne({ user: user })
            .populate({
                path: 'items.product',
                populate: { path: 'offer' }
            });

        if (!cart || cart.items.length === 0) {
            return res.render('../views/user/cart', { user, cartItems: [], cartTotal: 0, greatestDiscounts: [] });
        }

        const filteredCartItems = cart.items.filter(item => item.product.isListed);

        if (filteredCartItems.length < cart.items.length) {
            cart.items = filteredCartItems;
            await cart.save();
        }

        const cartData = filteredCartItems.map(item => {
            let itemPrice = item.product.price;
            let greatestDiscount = 0;

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

        res.render('../views/user/cart', { user, cartItems: cartData, cartTotal, greatestDiscounts });
    } catch (error) {
        console.error('Error fetching cart:', error);
        res.status(httpStatus.INTERNAL_SERVER_ERROR).send('Server Error');
    }
};

// ➕ Add to Cart
const addToCart = async (req, res) => {
    try {
        if (!req.session.user) {
            return res.json({ success: false, message: "Please login" ,href:'/login'});
        }

        const { productId } = req.body;
        const product = await Product.findById(productId).populate('offer');

        if (!product) {
            return res.status(httpStatus.NOT_FOUND).json({ success: false, message: 'Product not Found' });
        }

        let cart = await Cart.findOne({ user: req.session.user });
        if (!cart) {
            cart = new Cart({ user: req.session.user, items: [], totalAmount: 0 });
        }

        const cartItemIndex = cart.items.findIndex(item => item.product.toString() === productId);
        if (cartItemIndex > -1) {
            return res.json({ success: false, message: 'Product already added to cart. Check Cart', cart });
        }

        cart.items.push({ product: productId, quantity: 1 });
        cart.totalPrice += product.price;
        await cart.save();

        res.json({ success: true, message: 'Product added to cart', cart });
    } catch (error) {
        console.error(error);
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ success: false, message: 'Error adding product to cart' });
    }
};

// 🗑️ Remove from Cart
const removeFromCart = async (req, res) => {
    try {
        const userId = req.session.user;
        const { productId } = req.body;

        const cart = await Cart.findOne({ user: userId });
        if (!cart) {
            return res.json({ success: false, message: 'Cart not Found' });
        }

        cart.items = cart.items.filter(item => item.product.toString() !== productId);
        await cart.save();

        res.json({ success: true, message: 'Item removed from cart' });
    } catch (error) {
        console.error('Error removing item from cart:', error);
        res.json({ success: false, message: 'Internal server error' });
    }
};

// 🔄 Update Cart Quantity
const updateQuantity = async (req, res) => {
    const { productId, quantity } = req.body;

    try {
        const cart = await Cart.findOne({ user: req.session.user });
        if (!cart) {
            return res.status(httpStatus.NOT_FOUND).json({ success: false, message: 'Cart not found' });
        }

        const cartItem = cart.items.find(item => item.product.toString() === productId);
        if (!cartItem) {
            return res.status(httpStatus.NOT_FOUND).json({ success: false, message: 'Product not found in cart' });
        }

        const product = await Product.findById(productId).populate('offer');
        if (!product) {
            return res.status(httpStatus.NOT_FOUND).json({ success: false, message: 'Product not found' });
        }

        if (quantity > product.stock) {
            return res.json({
                success: false,
                message: `You cannot add more than ${product.stock} items. Available stock: ${product.stock}`
            });
        }

        cartItem.quantity = quantity;
        await cart.save();

        let productPrice = product.price;
        if (product.offer) {
            productPrice -= product.price * (product.offer.discount / 100);
        }

        const cartTotal = cart.items.reduce((total, item) => {
            const itemProductPrice = item.product.toString() === productId ? productPrice : product.product.price;
            return total + (item.quantity * itemProductPrice);
        }, 0);

        res.json({
            success: true,
            message: 'Cart Updated Successfully',
            cartTotal: cartTotal.toFixed(2),
            productPrice: productPrice.toFixed(2)
        });
    } catch (error) {
        console.error('Error updating cart quantity:', error);
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ success: false, message: 'Failed to update cart' });
    }
};

module.exports = {
    getCart,
    addToCart,
    removeFromCart,
    updateQuantity
};
