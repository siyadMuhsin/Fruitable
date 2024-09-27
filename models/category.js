const mongoose=require("mongoose")
const categorySchema= new mongoose.Schema({

    name:{
        type:String,
        required:true,
        unique:true
    },
    description:{
        type:String,
        required:false
    },
    isListed:{
        type:Boolean,
        default:false

    }

},{timestamps:true})
const CategoryDB=mongoose.model('Category',categorySchema)
module.exports=CategoryDB