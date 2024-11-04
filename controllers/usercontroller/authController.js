const User = require('../../models/usermodel');
const Otp =require('../../models/otpModel')
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const session=require('express-session')
const crypto = require('crypto');
const Wallet= require('../../models/WalletModel')
const Products=require('../../models/Products')



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
   const products= await Products.find({isListed:true}).populate('category')

    const user=req.session.user
  

   res.render('../views/user/index',{user,products});
}


exports.showSignup = (req, res) => {
    res.render('../views/user/signup');
};

exports.requestOtp = async (req, res) => {
    const { email, username, password } = req.body;
    if (!email || !username || !password) {
        return res.status(400).send('All fields are required');
    }


    // Check if email is already in use
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
        return res.render('user/signup', { msg: "Email already used" });
    }

    // Check if username is already in use
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
        return res.render('user/signup', { msg: "Username already used" });
    }
    const otp = crypto.randomInt(1000, 9999).toString();
   
    const otpExpires = Date.now() + 1 * 60 * 1000; // 1 minutes validity

    const otpEntry= new Otp({
        email,
        otp,
        expires:otpExpires
    })
    await otpEntry.save()

    
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
    try {
       
        const {email}=req.body  
        const user =await User.findOne({email})
        if(user){     
            return res.status(400).send('User not found');    
        }
       
        
        const currentTime= Date.now()
        const otpEntry= await Otp.findOne({email})
    
        if (otpEntry && otpEntry.expires>currentTime){
            return res.status(400).send('please wait before requesting a new OTP')
        }
        // Generate and send new OTP
        const otp =crypto.randomInt(1000,9999).toString()
     
       await Otp.updateOne({email},{otp,expires:currentTime + 1 * 60 * 1000},{upsert:true})
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
            res.redirect('/')
        })
    } catch (error) {
        console.log(error)
    }
   
}

exports.verifyOtp = async (req, res) => {
    const { username, email, password, otp1, otp2, otp3, otp4 } = req.body;
    const otpInput = otp1 + otp2 + otp3 + otp4;
    if (!username || !email || !password || !otpInput) {
        return res.status(400).send('All fields are required');
    }
   const otpEntry= await Otp.findOne({email})
    if (!otpEntry || otpEntry.otp !==otpInput){
        if(otpEntry && otpEntry.expires<Date.now()){
            await Otp.deleteOne({email})
            return res.render('../views/user/otp',{
                email,
                username,
                password,
                errorMessage:'OTP expired'
            })

        }
        return res.render('../views/user/otp',{
            email,
            username,
            password,
            errorMessage:'Invalid OTP'
        })
    }
 

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    const user = new User({
        username,
        email,
        password:hash
    })
    await user.save();
    const wallet = new Wallet({ user: user._id });
    await wallet.save();


    await Otp.deleteOne({email})
    res.redirect('/login')
};


//login 
exports.userLogin=async (req,res)=>{  
    
    // if(req.session.user){    
    //     res.redirect('/home')   
    // }else{
    //     res.render('../views/user/userLogin')
    // }
    res.render('../views/user/userLogin')
}

//Check login Detailes..
exports.checkDetails=async (req,res)=>{
  
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
                let wallet = await Wallet.findOne({ user: check._id });

                // If the wallet does not exist, create it
                if (!wallet) {
                    wallet = new Wallet({ user: check._id });
                    await wallet.save();
                }

                
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
    
    try {
        req.session.user = null; // Clear only user session
        res.redirect('/home');
    } catch (error) {
        console.error("Error during logout:", error);
        return res.status(500).send("Internal Server Error");
    }
}
exports.getForgetPassword=(req,res)=>{

    res.render('../views/user/forgetPassword')
}

exports.forgetPassword=async (req,res)=>{
    
    const {email}=req.body

    try {
        const user= await User.findOne({email})
        if(!user){
            return res.json({success:false,message:'User with this email does not exist.'})
        }
        
        const token = crypto.randomBytes(32).toString('hex')
       
        const tokenExpiry=Date.now()+3600000;
        user.resetPasswordToken = token;
        user.resetPasswordExpires = tokenExpiry;
        await user.save()


        const resetUrl = `https://${process.env.DOMIN_NAME}/reset-password/${token}`;
        const mailOptions = {
            to: user.email,
            from: 'no-reply@fruitable.com',
            subject: 'Password Reset',
            text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n
                   Please click on the following link, or paste this into your browser to complete the process:\n\n
                   ${resetUrl}\n\n
                   If you did not request this, please ignore this email and your password will remain unchanged.\n`,
        };
        await transporter.sendMail(mailOptions,(err,response)=>{
            if(err){
                console.error('Error sending email:', err);
                return res.status(500).json({ success: false, message: 'Error sending the reset email' });
            }
            res.json({ success: true, message: 'Password reset link sent' });

        })



    } catch (error) {
        console.error('Error in forgotPassword:', error);
        res.status(500).json({ success: false, message: 'Server error' });
        
    }
}
exports. resetPasswordGet=async(req,res)=>{
    try {
        const { token }=req.params
        
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() } // Ensure token has not expired
        });
      
        if (!user) {
            return res.status(400).json({ message: 'Password reset token is invalid or has expired.' });
        }
        res.render('../views/user/resetPassword',{token})
        
    } catch (error) {
        console.error('Error fetching reset password page:', error);
        return res.status(500).json({ message: 'Server error. Please try again later.' });
        
    }
}
exports .resetPassword= async(req,res)=>{
    
    try {
        const {token}= req.params
        const {password}=req.body
         
        const user= await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }

        })
        if(!user){
            return res.status(400).json({ success: false, message: 'Password reset token is invalid or has expired' });
        }
        const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);
        user.password = hashPassword;
        user.resetPasswordToken=undefined;
        user.resetPasswordExpires=undefined;
        await user.save()
        res.json({ success: true, message: 'Password has been reset' });
       
    } catch (error) {
        console.error('Error in resetPassword:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
   

    
}