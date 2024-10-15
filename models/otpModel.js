const mongoose=require('mongoose')
const otpSchema = new mongoose.Schema({
    email:{
        type:String,
        required:true
    },
    otp:{
        type:String,
        required:true
    },
    expires:{
        type:Date,
        required:true
    },
},{timestamps:true})

const otp = mongoose.model('Otp',otpSchema)
module.exports= otp;