const User = require("../../models/usermodel")

const getUsers = async (req, res) => {
    const page = parseInt(req.query.page) || 1; 
    const limit = parseInt(req.query.limit) || 10; 
    try {
        const totalUsers = await User.countDocuments(); 
        const totalPages = Math.ceil(totalUsers / limit); 
        const users = await User.find()
            .sort({ createdAt: -1 }) 
            .skip((page - 1) * limit)
            .limit(limit);

        res.render('../views/admin/Users', {
            users,
            currentPage: page,
            totalPages,
            limit,
        });
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).send("Server Error");
    }
};
const blockUser= async(req,res)=>{
  
    try{
       const  userId=req.params.id
       
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