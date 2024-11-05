const passport=require("passport")
const session=require("express-session")
const GoogleStrategy=require("passport-google-oauth20").Strategy
const User =require("../../models/usermodel")
require('dotenv').config()



//passport confugration for google OAuth
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,       // Store these in environment variables
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/auth/google/callback"          // Redirect URI specified in Google Cloud
},

async (accessToken,refreshToken,profile,done)=>{
    try{
        //Find or create a new user
        let ischeck= await User.findOne({email:profile.emails[0].value})

        if(ischeck){
            ischeck.GooggleId=profile.id,
            ischeck.isGoogleUser=true

        }
        
        let user = await User.findOne({GooggleId:profile.id});
       
        if(!user){
            user= new User({
                GooggleId:profile.id,
                isGoogleUser:true,
                username:profile.displayName,
                email:profile.emails[0].value,
                //add more field (options) 
            })
            await user.save();
        }
        
        return done(null,user);
    }catch(err){
        return done(err,null)
    }

}
))


passport.serializeUser((user,done)=>{
    done(null,user.id);
})
passport.deserializeUser(async(id,done)=>{
    try{
        const user=await User.findById(id);
        done(null,user);
    }catch(err){
        done(err,null)
    }
})