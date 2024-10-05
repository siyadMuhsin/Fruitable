// Middleware to check if user is authenticated
const User=require("../models/usermodel")
const isAuthenticated=(req,res,next)=>{
    if(req.session && req.session.user){
        console.log('logine middleware')
        return next() // User is authenticated, proceed to the next middleware or route handler
    }else{
        return res.redirect('/home')// User is not authenticated, redirect to login
    }
 
}

// Middleware to prevent logged-in users from seeing login/signup pages
const isGuest =(req,res,next)=>{
    if(req.session && req.session.user){
         // User is already logged in, redirect to home page
        return res.redirect('/home')
    }else{
              // User is not logged in, proceed to login/signup page
        return next()
    }
}

const isBlocked=async  (req,res,next)=>{
    const userId=req.session.user
    const check= await User.findById(userId)
    console.log(check)
    if(check.isBlocked){
        req.session.destroy((err) => {
            if (err) {
                console.error("Error during logout:", err);
                return res.status(500).send("Internal Server Error");
            }
            return res.send(`
                                    <html>
                         <body>
                             <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
                             <script>
                                 Swal.fire({
                                     icon: 'error',
                                     title: 'Oops...',
                                     text: 'Admin Blocked You ! Please SignUp new account',
                                     confirmButtonText: 'OK'
                                 }).then((result) => {
                                     if (result.isConfirmed) {
                                         window.location.href = "/home"; 
                                     }
                                 });
                             </script>
                         </body>
                     </html>
                                 `);
           
            
        })
    }else{
        next()

    }
 

}


const noCache=(req,res,next)=>{
    res.set('Cache-Control','no-store');
    next();
}


module.exports = {
    isAuthenticated,
    isGuest,
    noCache,
    isBlocked
}