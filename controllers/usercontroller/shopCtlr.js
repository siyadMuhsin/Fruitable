const ProducDB=require("../../models/Products")
const CategoryDB=require("../../models/category")
const httpStatus=require('../../types/HTTP_STATUS')
const showProducts = async (req, res) => {
    const user = req.session.user || false;
    const selectedCategoryId = req.query.category || null;
    const sortOption = req.query.sort || 'default';
    const page = parseInt(req.query.page) || 1;
    const searchName = req.query.query || ''; // Search query from the user

    const limit = 6;
    try {
        // Fetch categories and product count per category
        const categories = await CategoryDB.aggregate([
            {
                $match: { isListed: true }
            },
            {
                $lookup: {
                    from: 'products',
                    localField: '_id',
                    foreignField: 'category',
                    as: 'products'
                }
            },
            {
                $addFields: {
                    productCount: { $size: "$products" }
                }
            },
            {
                $project: {
                    name: 1,
                    productCount: 1
                }
            }
        ]);
        

        // Build query for products
        let query = { isListed: true };
        if (selectedCategoryId) {
            query.category = selectedCategoryId;
        }
        if (searchName) {
            query.name = { $regex: searchName, $options: 'i' }; // Case-insensitive search
        }

        // Build sort options
        let sort = {};
        if (sortOption === 'priceLowHigh') {
            sort.price = 1; // Sort by price ascending
        } else if (sortOption === 'priceHighLow') {
            sort.price = -1; // Sort by price descending
        } else if (sortOption === 'aToZ') {
            sort.name = 1; // Sort by name A to Z
        } else if (sortOption === 'zToA') {
            sort.name = -1; // Sort by name Z to A
        }

        // Count total products for pagination
        const totalProducts = await ProducDB.countDocuments(query);
        const totalPages = Math.ceil(totalProducts / limit);

        // Fetch the products with their categories and offers
        let products = await ProducDB.find(query)
            .populate('category')
            .populate('offer') // Assuming the field is 'offers' as an array
            .sort(sort)
            .skip((page - 1) * limit)
            .limit(limit);

        // Calculate the greatest discount for each product
        const greatestDiscounts = products.map(product => {
            let greatestDiscount = 0;
        
            // Check if the product has offers and if they are active
            if (product.offer && product.offer.length > 0) {
                // Filter for active offers before finding the greatest discount
                const activeOffers = product.offer.filter(offer => offer.isActive);
        
                if (activeOffers.length > 0) {
                    // Get the highest discount from the active offers
                    greatestDiscount = Math.max(...activeOffers.map(offer => offer.discount));
                }
            }
        
            return greatestDiscount; // Add to an array to pass separately
        });
        // Render the shop page
        res.render('../views/user/shop', {
            products, // List of products
            greatestDiscounts, // Array of greatest discounts corresponding to products
            user,
            categories,
            selectedCategoryId,
            sortOption,
            totalPages,
            currentPage: page,
            searchName // Pass the search query to the view to display in the search box
        });
    } catch (error) {
        console.error(error);
        res.status(httpStatus.INTERNAL_SERVER_ERROR).send('Server Error');
    }
};



const productDetail = async (req, res) => {
    const user = req.session.user || false;
    const productId = req.params.id;

    try {
        // Fetch the product and its offers
        const product = await ProducDB.findById(productId)
            .populate('category')
            .populate('offer'); // Assuming 'offer' is an array of offers

        if (!product) {
            return res.status(httpStatus.NOT_FOUND).send('Product not found');
        }

        // Calculate the greatest discount from all offers
        let greatestDiscount = 0;
        if (product.offer && product.offer.length > 0) {
            product.offer.forEach(offer => {
                if (offer.isActive && offer.discount > greatestDiscount) { // Check if offer is active
                    greatestDiscount = offer.discount;
                }
            });
        }

        // Pass the product and the greatest discount to the view
        res.render('../views/user/shop-detail', { product, greatestDiscount, user });
    } catch (error) {
        console.log('Error fetching product details:', error);
        res.status(httpStatus.INTERNAL_SERVER_ERROR).send('Server Error');
    }
};

module.exports={
    showProducts,
    productDetail,
    
}