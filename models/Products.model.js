const { default: mongoose } = require("mongoose");
const CategoryDB = require("./category.model");

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
    
    images:{
        type:[String],
       required:true
    },
    isListed: {
        type: Boolean,
        default: true
    },
    offer:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Offer',
        default:null
    }]


}, { timestamps: true });

const Products= mongoose.model('Products',productSchema)
module.exports=Products