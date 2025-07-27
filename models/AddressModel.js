const mongoose = require('mongoose');

const User=require('./usermodel')

const addressSchema=new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:User,
        required:true
    },
    name:{
        type:String,
        required:true
    },
    phone:{
        type:String,
        requiired:true
    },
   
    pincode:{
        type:String,
        required:true
    },
    locality: {
        type: String,
        required: true
      },
      landmark: {
        type: String
      },
      district: {
        type: String,
        required: true
      },
      state: {
        type: String,
        required: true
      },
      country: {
        type: String,
        required: true
      },
      address: {
        type: String,
        required: true
      },
      addressType: {
        type: String,
        enum: ['Home', 'Office', 'Other'],
        required: true
      }
    }, { timestamps: true });


const Address=mongoose.model('Address',addressSchema)

module.exports=Address