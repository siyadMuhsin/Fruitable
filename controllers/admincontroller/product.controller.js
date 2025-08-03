const { exitOnError } = require("winston");
const ProductDB = require("../../models/Products.model");
const CategoryDB = require('../../models/category.model');
const httpStatus = require('../../types/HTTP_STATUS');

// create product
const createProduct = async (req, res) => {
    try {
        const id = req.params.id;
        const { name, category, price, stock, description } = req.body;

        const imageFiles = req.files.map(file => file.filename);

        const exisName = await ProductDB.findOne({ name });
        if (exisName) {
            return res.status(httpStatus.BAD_REQUEST).json({
                success: false,
                message: 'Products Name already used !',
                red: '/admin/products'
            });
        } else {
            const newProduct = new ProductDB({
                name,
                category,
                price,
                stock,
                description,
                images: imageFiles
            });
            console.log("saved");
            await newProduct.save();
            res.json({ success: true, message: 'Product created successfully!', red: "/admin/products" });
        }
    } catch (error) {
        console.error('Error creating product:', error);
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ success: false, message: 'Error creating product' });
    }
};

// getProducts
const getProducts = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = 8;
    const skip = (page - 1) * limit;
    try {
        const trotalProducts = await ProductDB.countDocuments();
        const totalPages = Math.ceil(trotalProducts / limit);
        const categories = await CategoryDB.find();
        const products = await ProductDB.find()
            .populate('category')
            .skip(skip)
            .limit(limit)
            .sort({createdAt:-1});

        res.render('../views/admin/products', {
            products,
            categories,
            currentPage: page,
            totalPages
        });

    } catch (error) {
        console.log(error);
        res.status(httpStatus.INTERNAL_SERVER_ERROR).send(error);
    }
};

// edit products
const editProduct = async (req, res) => {
    try {
        const { id, name, category, price, stock, description, status } = req.body;

        const product = await ProductDB.findById(id);
        if (!product) {
            return res.status(httpStatus.NOT_FOUND).json({
                success: false,
                message: 'Products Not found Find not id!',
                red: '/admin/products'
            });
        }
        const existingName=await ProductDB.findOne({_id:{$ne:product._id},name:name})
        if(existingName){
            return res.status(httpStatus.BAD_REQUEST).json({
                success:false,
                message:"Product Name Already Used"
            })
        }
        product.name = name;
        product.category = category;
        product.price = price;
        product.stock = stock;
        product.description = description;
        product.status = status;

        if (req.files && req.files.length > 0) {
            const uploadedImages = req.files.map(file => file.filename);
            product.images.push(...uploadedImages);
        }

        await product.save();
        return res.status(httpStatus.OK).json({
            success: true,
            message: 'Product updated Successfully',
            red: '/admin/products'
        });
    } catch (err) {
        console.log(err);
        return res.status(httpStatus.BAD_REQUEST).send(err);
    }
};

const removeImage = async (req, res) => {
    try {
        const { imageName, productId } = req.body;

        await ProductDB.findOneAndUpdate(
            { _id: productId },
            { $pull: { images: imageName } },
            { new: true }
        );

        return res.status(httpStatus.OK).json({ success: true, msg: 'Image removed successfully' });
    } catch (err) {
        console.error('Error updating database:', err);
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).send('Error updating database');
    }
};

const listProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await ProductDB.findByIdAndUpdate(id, { isListed: true }, { new: true });
        if (!product) {
            return res.status(httpStatus.NOT_FOUND).json({ message: 'Product not found' });
        }
        res.json({ message: 'Product has been listed successfully!' });
    } catch (error) {
        console.error(error);
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Failed to list the product' });
    }
};

const unListProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await ProductDB.findByIdAndUpdate(id, { isListed: false }, { new: true });
        if (!product) {
            return res.status(httpStatus.NOT_FOUND).json({ message: 'Product not found' });
        }
        res.json({ message: 'Product has been unlisted successfully!' });
    } catch (error) {
        console.error(error);
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ success: false, message: 'Failed to unlist the product.' });
    }
};

module.exports = {
    createProduct,
    editProduct,
    removeImage,
    listProduct,
    unListProduct,
    getProducts
};
