const CategoryDB=require('../../models/category')




// Get all categories
const getCategories=async(req,res)=>{
    try {
        const categories= await CategoryDB.find()
        res.render('../views/admin/Category',{categories})// Render category list page    
    } catch (error) {
        console.log(error)
        res.status(500).send('Server error');    
    }
}

// Create a new category
const createCategory=async (req,res)=>{
    console.log(req.body)
    try {
        const {name,description,}=req.body
        let nameUpperCase=name.toUpperCase()

        const exisName=await CategoryDB.findOne({name:nameUpperCase})
        if(exisName){
            console.log('Category name already exists.')
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
        res.status(500).send('Server error');   
    }
}

// List a category
const listCategory =async(req,res)=>{
    try {

        const {id}=req.params
        await CategoryDB.findByIdAndUpdate(id,{isListed:true})
        res.redirect('/admin/category') // Redirect back to the category list
        
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
        
    }
}

// unList a category
const unListCategory=async (req,res)=>{
    try {
        const {id}=req.params
        await CategoryDB.findByIdAndUpdate(id,{isListed:false})
        res.redirect('/admin/category')
        
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
        
    }
}

//Edit Category
const editCategory= async(req,res)=>{
    console.log(req.body);
    try{
        const {_id,name,description}=req.body

        if(!_id|| _id==''){
            return res.status(400).send('Invalid category ID');

        }
        
       
    // Update the category in the database
        await CategoryDB.findByIdAndUpdate(_id,{
            name:name.toUpperCase(),
            description
        },{new:true})
        // Redirect back to the category list with a success message
        // req.flash('success_msg', 'Category updated successfully.');
        res.redirect('/admin/category'); // Adjust this path as necessary

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