const moongose=require("mongoose")


const userSchema =new moongose.Schema({
    username: {
        type: String,
        
      },
    GooggleId: {
        type: String,
       default:null

      },
      isGoogleUser:{
        type:Boolean,
        default:false
      },
      email: {
        type: String,
        required: true,
        unique: true
      },
    password: String,

    profilePhoto: {
        type: String,  // Store the photo URL as a string
        required: false // It may be optional if not all users have a profile photo
      },
      isBlocked:{
        type:Boolean,
        default:false

      },

    otp: String,
    otpExpires: Date,
    
},{timestamps:true})
const User=moongose.model('User',userSchema)
module.exports=User