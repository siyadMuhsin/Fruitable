const express=require('express')
const session=require('express-session')
const HttpStatus=require('../../types/HTTP_STATUS')
const adminEmail=process.env.ADMIN_EMAIL
const adminPassword=process.env.ADMIN_PASSWORD
// Admin login page handler
const adminGet=async (req,res)=>{
     // Check if admin is already logged in
    if(req.session.adminId){
  
        return res.redirect('/admin/sales-report')// Return here to stop further execution
    }
    res.render('../views/admin/login')

}

// Admin login check handler
const admincheck=async (req,res)=>{
    try{
    const {email,password}=req.body
 // Check if the provided email and password match admin credentials
    if(email===adminEmail && password===adminPassword){
        req.session.adminId={email,password}// Set session variable for admin login
       
        return res.redirect('/admin/sales-report'); 
    }else{
       return res.render('../views/admin/login',{msg:'Invalid Email Or Password'})
    }
    }catch(err){
        console.error("Error during admin login:", err);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).send("Internal Server Error");
    }
}


//admin log out
const adminLogout=async (req,res)=>{
    req.session.adminId=null
    res.redirect('/admin/')

}

// Admin dashboard handler
const getDashboard=async (req,res)=>{
    
    
}
module.exports={
    adminGet,
    admincheck,
    getDashboard,
    adminLogout
}