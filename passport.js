const passport = require('passport');
const strategy = require('passport-facebook');
const User = require('./models/user');
const session = require('express-session');
const FacebookStrategy = require('passport-facebook').Strategy;
 
passport.use(
  new FacebookStrategy(
  {
    clientID : "1237525486886834",
    clientSecret : "4aa09b7b5ab9d9d3db7beeb67e97315c",
    callbackURL : "http://localhost:3000/login/callback",
    profileFields: ['id', 'displayName']
  },
    
  async function(accessToken,refreshToken,profile,done)
  {   
    console.log(accessToken,refreshToken,profile)
        
    const id = profile.id;
    const name = profile.displayName;
    // const email = profile.emails[0].value;
    const user = await User.findOne({fbID : id});
    if(!user)
    {
        const user = new User({fbID : id , name});
        await user.save();
        console.log('Facebook profile data stored in database');
    }
    done(null,user);
  }
  )
  
);