const Products = require('../../models/Products.model');
const Categories = require('../../models/category.model');
const Offer = require('../../models/offer.model');
const httpStatus = require('../../types/HTTP_STATUS'); // assuming you already have this

const getOfferPage = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 10;

        const totalOffers = await Offer.countDocuments();
        const totalPages = Math.ceil(totalOffers / limit);

        const offers = await Offer.find()
            .populate({
                path: 'applicableItems',
                select: 'name _id'
            })
            .skip((page - 1) * limit)
            .limit(limit);

        const products = await Products.find();
        const categories = await Categories.find();

        res.render('../views/admin/offers', {
            products,
            categories,
            offers,
            currentPage: page,
            totalPages
        });
    } catch (error) {
        console.log(error);
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ success: false, message: 'Server error. Please try again later.' });
    }
};

// create offers
const createOffer = async (req, res) => {
    try {
        const { offerName, offerDescription, discountAmount, applicableType, selectedItems, startDate, endDate } = req.body;
        const existingOffer = await Offer.findOne({ name: offerName });
        if (existingOffer) {
            return res.status(httpStatus.BAD_REQUEST).json({ success: false, message: 'Offer name already used!' });
        }

        const offer = new Offer({
            name: offerName.toUpperCase(),
            description: offerDescription,
            discount: discountAmount,
            applicableType,
            applicableItems: selectedItems,
            startDate,
            endDate
        });

        const savedOffer = await offer.save();

        if (applicableType === 'category') {
            const productsInCategory = await Products.find({ category: { $in: selectedItems } });
            const productIds = productsInCategory.map(product => product._id);

            await Products.updateMany(
                { _id: { $in: productIds } },
                { $addToSet: { offer: savedOffer._id } }
            );
        } else if (applicableType === 'product') {
            await Products.updateMany(
                { _id: { $in: selectedItems } },
                { $addToSet: { offer: savedOffer._id } }
            );
        }

        res.status(httpStatus.CREATED).json({ success: true, message: "Offer created successfully!" });
    } catch (error) {
        console.error('Error creating offer:', error);
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ success: false, message: 'Server error. Please try again later.' });
    }
};

// updateOffer
const updateOffer = async (req, res) => {
    try {
        const { offerId, name, description, discount, applicableType, applicableItems, startDate, endDate } = req.body;

        let offerName = name.toUpperCase();

        const existingOffer = await Offer.findById(offerId);
        if (!existingOffer) {
            return res.status(httpStatus.NOT_FOUND).json({ success: false, message: 'Offer not found!' });
        }

        const updatedOffer = await Offer.findByIdAndUpdate(offerId, {
            name: offerName,
            description,
            discount,
            applicableType,
            applicableItems,
            startDate,
            endDate
        }, { new: true });

        if (existingOffer.applicableType === 'category') {
            const productsInOldCategory = await Products.find({ category: { $in: existingOffer.applicableItems } });
            const oldProductIds = productsInOldCategory.map(product => product._id);

            await Products.updateMany(
                { _id: { $in: oldProductIds } },
                { $pull: { offers: existingOffer._id } }
            );
        } else if (existingOffer.applicableType === 'product') {
            await Products.updateMany(
                { _id: { $in: existingOffer.applicableItems } },
                { $pull: { offers: existingOffer._id } }
            );
        }

        if (applicableType === 'category') {
            const productsInNewCategory = await Products.find({ category: { $in: applicableItems } });
            const newProductIds = productsInNewCategory.map(product => product._id);

            await Products.updateMany(
                { _id: { $in: newProductIds } },
                { $addToSet: { offers: updatedOffer._id } }
            );
        } else if (applicableType === 'product') {
            await Products.updateMany(
                { _id: { $in: applicableItems } },
                { $addToSet: { offers: updatedOffer._id } }
            );
        }

        res.status(httpStatus.OK).json({ success: true, message: 'Offer updated successfully!', offer: updatedOffer });
    } catch (error) {
        console.log('Error updating offer:', error);
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ success: false, message: 'Server error. Please try again later.' });
    }
};

// active and deactivate function
const activateOffer = async (req, res) => {
    const offerId = req.params.id;

    try {
        const offer = await Offer.findById(offerId);
        if (!offer) {
            return res.status(httpStatus.NOT_FOUND).json({ success: false, message: 'Offer not found' });
        }

        offer.isActive = !offer.isActive;

        await offer.save();

        res.json({ success: true, isActive: offer.isActive });
    } catch (error) {
        console.error('Error toggling offer status:', error);
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ success: false, message: 'Server error' });
    }
};

const deactivateOffer = async (req, res) => {
    try {
        const offerId = req.params.id;
        await Offer.findByIdAndUpdate(offerId, { isActive: false });
        res.json({ success: true, message: 'Offer deactivated successfully.' });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: 'Failed to deactivate offer.' });
    }
};

module.exports = {
    getOfferPage,
    createOffer,
    updateOffer,
    activateOffer,
    deactivateOffer
};
