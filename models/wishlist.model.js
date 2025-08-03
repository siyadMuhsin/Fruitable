const mongoose = require('mongoose');

const ProductDB=require("./Products.model")
const User=require("./user.model")
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