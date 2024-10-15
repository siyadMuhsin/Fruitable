const ProducDB=require("../../models/Products")
const CategoryDB=require("../../models/category")

const showProducts = async (req, res) => {
    const user = req.session.user || false;
    const selectedCategoryId = req.query.category || null; 
    const sortOption = req.query.sort || 'default';
    const page = parseInt(req.query.page) || 1;
    const searchName = req.query.query || ''; // Search query from the user

    const limit = 6;
    try {
        const categories = await CategoryDB.aggregate([
            {
                $match: {
                    isListed: true 
                }
            },
            {
                $lookup: {
                    from: 'products',
                    localField: '_id', 
                    foreignField: 'category', 
                    as: 'products', 
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


        let query = { isListed: true };
        if (selectedCategoryId) {
            query.category = selectedCategoryId;
        }
        if (searchName) {
            query.name = { $regex: searchName, $options: 'i' }; // Case-insensitive search on product name
        }

    
        let sort = {};
        if (sortOption === 'priceLowHigh') {
            sort.price = 1; // Sort by price ascending
        } else if (sortOption === 'priceHighLow') {
            sort.price = -1; // Sort by price descending
        }else if(sortOption === 'aToZ'){
            console.log("a to z")
            sort.name=1
        }else if(sortOption === 'zToA'){
            sort.name=-1
        }


       
        const totalProducts = await ProducDB.countDocuments(query);
        const totalPages = Math.ceil(totalProducts / limit);

        // Fetch the products based on query, sort, and pagination
        const products = await ProducDB.find(query)
            .populate('category')
            .sort(sort)
            .skip((page - 1) * limit)
            .limit(limit);

        res.render('../views/user/shop', {
            products,
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
        res.status(500).send('Server Error');
    }
};





const productDetail=async (req,res)=>{
    const user = req.session.user || false;

    const productId=req.params.id
    try {
        const product=await ProducDB.findById(productId).populate('category');
        
        if(!product){
            return res.status(404).send('Product not found');
        }
        res.render('../views/user/shop-detail',{product,user})    
    } catch (error) {
        console.log(error)    
    }
}


module.exports={
    showProducts,
    productDetail,
    
}