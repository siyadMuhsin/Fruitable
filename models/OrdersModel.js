const mongoose=require('mongoose')
const User=require('./usermodel')

const ordersSchema=new mongoose.Schema({
    orderId:{type:String,required:true},
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:User,
        required:true

    },
    address: {
        name: { type: String, required: true },
        phone: { type: String, required: true },
        pincode: { type: String, required: true },
        locality:{ type: String, required: true },
        address: { type: String, required: true },
        district: { type: String, required: true },
        landmark:{type:String,required:true},
        addressType:{type:String,enum: ['Home', 'Office', 'Other'],required:true},
        
        

      
    },
    paymentMethod: { type: String, required: true },
    items:[
        {
            productId:String,
            productName:{type:String,required:true},
            productImage:{type:String},
            quantity: { type: Number, required: true },
            price: { type: Number, required: true },

        }
    ],
    subtotal:{type:Number,required:true},
    deleveryCharge:{type:Number,require:true},
    totalPrice:{type:Number,require:true},
    orderDate: { type: Date, default: Date.now },
   
    status: {
        type: String,
        enum: [
            'Order placed',
            'Pending',
            'Confirmed',
            'Shipped',
            'Out for Delivery',
            'Delivered',
            'Cancelled'
        ],
        default: 'Pending', // Default status if not specified
    }, // Status of the orde
  
})
const Order= mongoose.model('Order',ordersSchema)
module.exports=Order