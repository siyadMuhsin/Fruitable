// Middleware to check if user is authenticated

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




const noCache=(req,res,next)=>{
    res.set('Cache-Control','no-store');
    next();
}


module.exports = {
    isAuthenticated,
    isGuest,
    noCache,
    
}