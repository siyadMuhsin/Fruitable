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
    phone:{
      type:String

    },

    profilePhoto: {
        type: String,  // Store the photo URL as a string
        required: false // It may be optional if not all users have a profile photo
      },
      isBlocked:{
        type:Boolean,
        default:false

      },
      resetPasswordToken: {
        type: String
    },
    resetPasswordExpires: {
        type: Date
    },
    
},{timestamps:true})
const User=moongose.model('User',userSchema)
module.exports=User