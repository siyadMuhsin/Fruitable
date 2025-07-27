const CategoryDB=require('../../models/category')

const httpStatus=require('../../types/HTTP_STATUS')


// Get all categories
const getCategories=async(req,res)=>{
    try{
        const page=parseInt(req.query.page) || 1
        const limit =parseInt(req.query.limit)|| 5

        const skip=(page-1)*limit;
        const categories=await CategoryDB.find().skip(skip).limit(limit)

        const totalCategories= await CategoryDB.countDocuments()
        const totalPages =Math.ceil(totalCategories/limit)
        res.render('../views/admin/Category',{
            categories,
            currentPage:page,
            totalPages,
            limit
        })
        }catch(error){
            console.log(error);
        res.status(httpStatus.INTERNAL_SERVER_ERROR).send('Server error');

    }
}

// Create a new category
const createCategory=async (req,res)=>{
 
    try {
        const {name,description,}=req.body
        let nameUpperCase=name.toUpperCase()

        const exisName=await CategoryDB.findOne({name:nameUpperCase})
        if(exisName){
           
           


return res.send(`
               <html>
    <body>
        <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
        <script>
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Category Name already used!',
                confirmButtonText: 'OK'
            }).then((result) => {
                if (result.isConfirmed) {
                    window.location.href = "/admin/category"; 
                }
            });
        </script>
    </body>
</html>
            `);

        }else{
            const newCategory =new CategoryDB({
                name:nameUpperCase,
                description:description,
            })
            await newCategory.save()
            res.redirect('/admin/category') 

        }
       
       

        
       
  
    } catch (error) {
        console.error(error);
        res.status(httpStatus.INTERNAL_SERVER_ERROR).send('Server error');   
    }
}

// List a category
const listCategory =async(req,res)=>{
    try {

        const {id}=req.params
        await CategoryDB.findByIdAndUpdate(id,{isListed:true})
       return res.status(httpStatus.OK).json({success:true,message:'Category listed successfully'})
        
    } catch (error) {
        console.error(error);
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Failed to list category' });
        
    }
}

// unList a category
const unListCategory=async (req,res)=>{
    try {
        const {id}=req.params
        await CategoryDB.findByIdAndUpdate(id,{isListed:false})
       return res.status(httpStatus.OK).json({success:true,message:'Category unlisted successfully'})
        
    } catch (error) {
        console.error(error);
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Failed to unlist category' });
        
    }
}

//Edit Category
const editCategory= async(req,res)=>{
   
    try{
        const _id=req.params.id
        const {name,description}=req.body

        if(!_id|| _id==''){
            return res.status(httpStatus.BAD_REQUEST).json({message:'Invalid category ID'});

        }
        const exisName= await CategoryDB.findOne({name})
        if(exisName){
            return res.status(httpStatus.BAD_REQUEST).json({success:false,message:'Category Name Already Used'});
        }
        
       
    // Update the category in the database
        await CategoryDB.findByIdAndUpdate(_id,{
            name:name.toUpperCase(),
            description
        },{new:true})
       return res.status(httpStatus.OK).json({success:true,message:'Category updated successfully.',red:'/admin/category'})
       

    }catch(error){
        // req.flash('error_msg', 'Error updating category.');
        console.log(error)
        res.redirect('/admin/category'); // Adjust this path as necessary
    }

    }
  

module.exports={
    getCategories,
    createCategory,
    listCategory,
    unListCategory,
    editCategory
}