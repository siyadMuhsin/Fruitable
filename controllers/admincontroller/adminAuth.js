const express=require('express')
const session=require('express-session')

const adminEmail=process.env.ADMIN_EMAIL
const adminPassword=process.env.ADMIN_PASSWORD
// Admin login page handler
const adminGet=async (req,res)=>{
     // Check if admin is already logged in
    if(req.session.adminId){
        console.log(req.session.adminId,'test')
        return res.redirect('/admin/dashboard')// Return here to stop further execution
    }
    console.log("Rendering admin login page")
    res.render('../views/admin/login')

}

// Admin login check handler
const admincheck=async (req,res)=>{
    try{
    const {email,password}=req.body
 // Check if the provided email and password match admin credentials
    if(email===adminEmail && password===adminPassword){
        req.session.adminId={email,password}// Set session variable for admin login
        console.log('Admin logged in');
        return res.redirect('/admin/dashboard'); 
    }else{
       return res.render('../views/admin/login',{msg:'Invalid Email Or Password'})
    }
    }catch(err){
        console.error("Error during admin login:", err);
        res.status(500).send("Internal Server Error");
    }
}


//admin log out
const adminLogout=async (req,res)=>{
    req.session.adminId=null
    res.redirect('/admin/')

}

// Admin dashboard handler
const getDashboard=async (req,res)=>{
     // Check if admin is logged in
    if(req.session.adminId){
        return res.render('../views/admin/dashboard')
    }else{
        res.redirect('/admin/')// Redirect to login if not logged in
    }
}
module.exports={
    adminGet,
    admincheck,
    getDashboard,
    adminLogout
}