const { default: mongoose } = require("mongoose");
const CategoryDB = require("./category");

const productSchema= new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    category: {
        type: mongoose.Schema.Types.ObjectId, // Reference to the category model
        ref:CategoryDB,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    stock: {
        type: Number,
        required: true
    },
    
    description: {
        type: String,
        required:true,
        minlength:30
    },
    unit:{
        type:String,
        default:'kg'
        

    },
    // images:[String],
    images:{
        type:[String],
       required:true
    },
    isListed: {
        type: Boolean,
        default: true
    },

}, { timestamps: true });

const Products= mongoose.model('Products',productSchema)
module.exports=Products