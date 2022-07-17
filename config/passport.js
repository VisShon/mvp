import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth2';
import jwt from 'jsonwebtoken';

passport.use('google',new GoogleStrategy({
    clientID:     GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/callback",
    passReqToCallback   : true
  },async(req,accessToken,refreshToken,profile,done) => {
    try {
        const obj = await User.findOne({email: profile.email});
        if (!obj){
            const newUser = new User({
                email: profile.email,
                name: profile.displayName,
                accessToken: accessToken
            })
            await newUser.save()


            const token = await jwt.sign({
                id: newUser._id,
                created: Date.now().toString(),
            },process.env.JWT_SECRET);
            newUser.tokens.push(token);


            await newUser.save()
            done(null,newUser,{message:"Auth Successfull",token: token})
        }
        else{
            const token = await jwt.sign({
                id: obj._id,
                created: Date.now().toString(),
            },process.env.JWT_SECRET);
            obj.tokens.push(token);


            await obj.save()
            done(null,obj,{message:"Auth Successfull",token: token})
        }
    }
    catch (err){
        console.error(err);
        done(err,false,{message: "Internal Server Error"});
    }
  }
));