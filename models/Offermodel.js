const mongoose = require('mongoose');
const Product = require('../models/Products');
const Category = require('./category');

const offerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        required: true,
        trim: true,
    },
    isActive:{
        type:Boolean,
        default:true
    },
    discount: {
        type: Number,
        required: true,
        min: 0, // Ensures that discount is not negative
    },
    applicableType: {
        type: String,
        enum: ['category', 'product'], // Only allows these two values
        required: true,
    },
    applicableItems: {
        type: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: function () {
                    // Reference either 'Category' or 'Product' based on applicableType
                    return this.applicableType === 'category' ? Category : Product;
                }
            }
        ],
        required: true,
    },
    startDate: {
        type: Date,
        required: true,
    },
    endDate: {
        type: Date,
        required: true,
    },
   
}, {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
});

const Offer = mongoose.model('Offer', offerSchema);
module.exports = Offer;
