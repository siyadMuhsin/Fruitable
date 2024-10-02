const mongoose=require("mongoose")
const ProductDB=require("../models/Products")
const User=require("../models/usermodel")
// Define the schema for items in the cart
const cartItemSchema = new mongoose.Schema({
    product:{
        type:mongoose.Schema.Types.ObjectId,
        ref:ProductDB,
        required:true
    },
    quantity:{
        type:Number,
      
        required:true
    }
})

// Define the schema for the cart
const cartSchema=new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:User,
        required:true
    },
    items:[cartItemSchema],// Define the schema for the cart
    totalAmount:{
        type:Number,
        default:0
    } // Total amount for the cart

})
const Cart=mongoose.model('Cart',cartSchema)
module.exports=Cart