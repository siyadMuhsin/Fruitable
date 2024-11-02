
const Products= require('../../models/Products')
const Categories= require('../../models/category')
const Offer= require('../../models/Offermodel')




const getOfferPage = async (req, res) => {

    try {
        const offers = await Offer.find().populate({
            path: 'applicableItems',
            select: 'name _id' // Only selecting 'name' and '_id'
        });
        
        // Automatically populates based on ObjectId references
        const products = await Products.find();
        const categories = await Categories.find();

        res.render('../views/admin/offers', { products, categories, offers });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: 'Server error. Please try again later.' });
    }
};

// create offers
const createOffer = async (req, res) => {
   

    try {
        const { offerName, offerDescription, discountAmount, applicableType, selectedItems, startDate, endDate } = req.body;
        const existingOffer = await Offer.findOne({ name: offerName });
        if (existingOffer) {
         
            return res.status(400).json({ success: false, message: 'Offer name already used!' });
        }

        // Create a new offer
        const offer = new Offer({
            name: offerName.toUpperCase(),
            description: offerDescription,
            discount: discountAmount,
            applicableType,
            applicableItems: selectedItems,
            startDate,
            endDate
        });

        // Save the offer to the database
        const savedOffer = await offer.save();

        // Update products with the new offer
        if (applicableType === 'category') {
            const productsInCategory = await Products.find({ category: { $in: selectedItems } });
            const productIds = productsInCategory.map(product => product._id);

            await Products.updateMany(
                { _id: { $in: productIds } },
                { $addToSet: { offer: savedOffer._id } } // Use $addToSet to avoid duplicates
            );
        } else if (applicableType === 'product') {
            await Products.updateMany(
                { _id: { $in: selectedItems } },
                { $addToSet: { offer: savedOffer._id } } // Use $addToSet to avoid duplicates
            );
        }

        
        res.status(201).json({ success: true, message: "Offer created successfully!" });
    } catch (error) {
        console.error('Error creating offer:', error);
        res.status(500).json({ success: false, message: 'Server error. Please try again later.' });
    }
};

// updateOffer
const updateOffer = async (req, res) => {
  
    try {
        const { offerId, name, description, discount, applicableType, applicableItems, startDate, endDate } = req.body;
        
        let offerName = name.toUpperCase();
        
        // Find the existing offer to know the old applicable items
        const existingOffer = await Offer.findById(offerId);
        if (!existingOffer) {
            return res.status(404).json({ success: false, message: 'Offer not found!' });
        }

        // Update the offer
        const updatedOffer = await Offer.findByIdAndUpdate(offerId, {
            name: offerName,
            description,
            discount,
            applicableType,
            applicableItems,
            startDate,
            endDate
        }, { new: true });

        // Remove the offer from old applicable items (products or categories)
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

        // Add the updated offer to new applicable items
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

        res.status(200).json({ success: true, message: 'Offer updated successfully!', offer: updatedOffer });
    } catch (error) {
        console.log('Error updating offer:', error);
        res.status(500).json({ success: false, message: 'Server error. Please try again later.' });
    }
};
// active and deactivate function 
const activateOffer= async(req,res)=>{
    const offerId = req.params.id;
    
    try {
        // Find the offer by ID
        const offer = await Offer.findById(offerId);
        if (!offer) {
            return res.status(404).json({ success: false, message: 'Offer not found' });
        }

        // Toggle the isActive status
        offer.isActive = !offer.isActive;

        // Save the updated offer
        await offer.save();

        // Respond with the new status
        res.json({ success: true, isActive: offer.isActive });
    } catch (error) {
        console.error('Error toggling offer status:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
}


const deactivateOffer= async(req,res)=>{
  
    try {
        const offerId= req.params.id;
        await Offer.findByIdAndUpdate(offerId,{isActive:false})
        res.json({ success: true, message: 'Offer deactivated successfully.' });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: 'Failed to deactivate offer.' });
    }
}
module.exports={
    getOfferPage,
    createOffer,
    updateOffer,
    activateOffer,
    deactivateOffer
}