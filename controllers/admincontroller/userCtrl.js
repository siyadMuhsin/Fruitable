const User = require("../../models/usermodel")

const getUsers=async (req,res)=>{
    const users= await User.find()
   
    console.log("users listed")
    res.render('../views/admin/users',{users})
}


const blockUser= async(req,res)=>{
  
    try{
       const  userId=req.params.id
        console.log(userId)
         // Find the user by ID and update the isBlocked status
        await User.findByIdAndUpdate(userId,{isBlocked:true})

        return res.status(200).json({message:'User Blocked Successfully'})

         // Redirect back to the users page after blocking
        res.redirect('/admin/users')
    }catch(error){
        console.error(error);
        res.status(500).json({ message: 'Failed to block user' });
    }

}

const unblockUser=async (req,res)=>{
    try {
        const userId=req.params.id
        await User.findByIdAndUpdate(userId,{isBlocked:false})
        return res.status(200).json({message:'User Unbocked Successfully'})
        
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Failed to Unblock user' });
        
    }
}

const getCategory=async (req,res)=>{
    try {
        
    } catch (error) {
        
    }
}


module.exports={
    getUsers,
    blockUser,
    unblockUser
}