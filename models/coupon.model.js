const mongoose=require('mongoose')
const couponSchema= new mongoose.Schema({
    code:{
        type:String,
        required:true,
        unique:true
    },
    discount:{
        type:Number,
        required:true
    },
    minPrice:{
        type:Number,
        required:true
    },
    startDate:{
        type:Date,
        required:true

    },
    endDate:{
        type:Date,
        required:true
    },
    active:{
        type:Boolean,
        default:true
    }
},{timestamps:true})

const Coupon=  mongoose.model('Coupons',couponSchema)
module.exports= Coupon;