const mongoose = require('mongoose');

const ProductDB=require("../models/Products")
const User=require("../models/usermodel")
const wishlistSchema= new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:User,
        required:true
    },
    items:[
        {
            product:{
                type:mongoose.Schema.Types.ObjectId,
                ref:ProductDB,
                requires:true
            }
        }
    ]
})

const Wishlist= mongoose.model('Wishlist',wishlistSchema)

module.exports=Wishlist;