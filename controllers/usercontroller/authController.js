const User = require('../../models/usermodel');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const session=require('express-session')
const crypto = require('crypto');



const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'muhsin4065@gmail.com',
        pass: 'nvdw ttey qkmx aonm' // Use environment variables for security
    }
});

exports.basic=async (req,res)=>{
    
    res.redirect('/home')
}
,
exports.getHome=async (req,res)=>{
    const user=req.session.user
    console.log('session user id ',user)

   res.render('../views/user/index',{user});
}


exports.showSignup = (req, res) => {
    res.render('../views/user/signup');
};

exports.requestOtp = async (req, res) => {
    const { email, username, password } = req.body;
    if (!email || !username || !password) {
        return res.status(400).send('All fields are required');
    }


    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return res.render('user/signup', { msg: "Email already used" });
    }
    const otp = crypto.randomInt(1000, 9999).toString();
    console.log(otp)
    const otpExpires = Date.now() + 1 * 60 * 1000; // 1 minutes validity
    let user = await User.findOne({ email });
    if (user) {
        user.otp = otp;
        user.otpExpires = otpExpires;
    } else {
        user = new User({ email, otp, otpExpires });
    }
    await user.save();
    const mailOptions = {
        from: 'muhsin4065@gmail.com',
        to: email,
        subject: 'Your OTP Code',
        text: `Your OTP code is ${otp}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error)
            return res.status(500).send('Failed to send OTP');
        }
        res.render('../views/user/otp', { email, username, password ,otpExpires});
    });
};


exports.resendOTP=async (req,res)=>{
    const {email}=req.body  
    const user =await User.findOne({email})
    if(!user){     
        return res.status(400).send('User not found');    
    }
    
    const currentTime= Date.now()
    if(user.otpExpires>currentTime){
        return res.status(400).send('Please wait before requesting a new OTP')
    }

    // Generate and send new OTP
    const otp =crypto.randomInt(1000,9999).toString()
    console.log(otp)
    user.otp=otp
    user.otpExpires=currentTime + 1 * 60 * 1000; // Reset expiration time
    await user.save()
    const mailOptions={
        from: 'muhsin4065@gmail.com',
        to: email,
        subject: 'Your OTP Code',
        text: `Your new OTP code is ${otp}`,
    };

    transporter.sendMail(mailOptions,(error,info)=>{
        if(error){
            console.log(error);
            return res.status(500).send('Failed to send OTP');
        }
        res.redirect('/verify-otp')
    })
}

exports.verifyOtp = async (req, res) => {
    const { username, email, password, otp1, otp2, otp3, otp4 } = req.body;
    const otpInput = otp1 + otp2 + otp3 + otp4;
    if (!username || !email || !password || !otpInput) {
        return res.status(400).send('All fields are required');
    }
    const user = await User.findOne({ email });
    if (!user || user.otp !== otpInput ) {
        if(user.otpExpires < Date.now()){
            await User.deleteOne({ email });
        }    
        return res.render('../views/user/otp', {
            email,
            username,
            password,
            errorMessage: 'Invalis OTP' // Pass an error flag to the view
        });
}

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    user.username = username;
    user.password = hash;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();
    res.redirect('/login')
};


//login 
exports.userLogin=async (req,res)=>{  
    console.log("login getting")
    // if(req.session.user){    
    //     res.redirect('/home')   
    // }else{
    //     res.render('../views/user/userLogin')
    // }
    res.render('../views/user/userLogin')
}

//Check login Detailes..
exports.checkDetails=async (req,res)=>{
    console.log('check details')
    const{email,password}=req.body
    try{
        const check= await User.findOne({email});
        if(!check){
            res.render('../views/user/userLogin',{msg:'Invalid Email or Password'})
        }else{
         
            const isMatch = await bcrypt.compare(password,check.password)
           
          if(isMatch){
            if(!check.isBlocked){

                req.session.user=check._id
                console.log(req.session.user)

                
                res.redirect('/home')

            }else{

                return res.send(`
                    <html>
         <body>
             <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
             <script>
                 Swal.fire({
                     icon: 'error',
                     title: 'Oops...',
                     text: 'you cant login',
                     confirmButtonText: 'OK'
                 }).then((result) => {
                     if (result.isConfirmed) {
                         window.location.href = "/"; 
                     }
                 });
             </script>
         </body>
     </html>
                 `);
               
           }

          }else{
            res.render('../views/user/userLogin',{msg:"Invalid Email or password"})
          }
        }
    }catch(err){
        console.error("Error during login:", err);
        res.status(500).send("Internal Server Error");
    }
}

//logout 
exports.logout = async (req, res) => {
    console.log("logout")
   
    try {
        req.session.destroy((err) => {
            console.log("distroyed")
            if (err) {
                console.error("Error during logout:", err);
                return res.status(500).send("Internal Server Error");
            }
            res.redirect('/home'); 
        });
    } catch (error) {
        console.error("Error during logout:", error);
        res.status(500).send("Internal Server Error");
    }
};

exports.forgetPassword=(req,res)=>{
    console.log("forget password get")
    res.render('../views/User/forgetPassword')
}

exports.resetPassword=async (req,res)=>{
    const {email}=req.body

    try {
        const user= await User.findOne({email})
        if(!user){
            return res.json({success:false,message:'User with this email does not exist.'})
        }
        
    } catch (error) {
        
    }
}
