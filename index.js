const express=require('express')
const app=express()
require('dotenv').config()
var stripe = require('stripe')('sk_test_51N00OFSF4sQhzetyF0Pcvc6TvwJo1zeIlj9jevG30po6XMwxbNQGUWLMsQbrPvabbmonpKzoQcuutchDvk2jCAca00QiPsxwAJ');
var publishablekey='pk_test_51N00OFSF4sQhzetyktessDQEydaHLo11g5OPHP03bWzokrH4s7n9OIPpcj7qNQy4U6yhMukuYbtvUSG2LszCBePK00uIsaiwa5'
const secretkey='sk_test_51N00OFSF4sQhzetyF0Pcvc6TvwJo1zeIlj9jevG30po6XMwxbNQGUWLMsQbrPvabbmonpKzoQcuutchDvk2jCAca00QiPsxwAJ'
const hbs=require('hbs')
const bodyparser=require('body-parser')
const passport = require('passport');
const mongoose = require('mongoose')
const session = require('express-session');
const {user}=require('./passport')
const FacebookStrategy = require('passport-facebook').Strategy;
require('./passport');
const nodeMail=require('nodemailer')
const path=require('path')
app.set('view engine','hbs')
app.use(bodyparser.urlencoded({extended:false}))

app.use(session({
    secret: '4aa09b7b5ab9d9d3db7beeb67e97315c',
    resave: true,
    saveUninitialized: true
  }));
  
  app.use(passport.initialize());
  app.use(passport.session());
  passport.serializeUser(function(user,cb){
    cb(null,user)
  })
  passport.deserializeUser(function(obj,cb){
    cb(null,obj)

  })
app.use(bodyparser.json())
app.use(express.static(path.join(__dirname,'./views')))
app.use(express.urlencoded({extended:true}))
async function mainMail(name,email,subject,message){
    const transporter=nodeMail.createTransport({
        host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    requireTLS: true,
    auth: {
        user: 'neharpotdar68@gmail.com',
        pass: 'egzgyqkqzhrmixqh'
    }
    })
    // transporter.verify((error, success) => {
    //     if (error) console.error(error);
    //     console.log("Server is ready to take our messages");
    // });
    
    transporter.use('compile', hbs({
        viewEngine: {
            extname: '.hbs',
            layoutsDir: 'views/',
            defaultLayout: false,
            partialsDir: 'views/',
        }, viewPath: 'views/', extName: '.hbs'
    }));
    const mailOption={
        from:email,
        to:"neharpotdar68@gmail.com",
        subject:subject,
        html: `You got a message from,
        Name: ${req.body.Name}, 
    Email : ${req.body.Email},
    Subject:${req.body.Subject},
    
    Message: ${req.body.Message}`
    }
    try {
        await transporter.sendMail(mailOption);
        return Promise.resolve("Message Sent Successfully!");
      } catch (error) {
        return Promise.reject(error);
      }
    

}
app.get('/',(req,res)=>{
    res.render('login')
})
app.get('/login', passport.authenticate('facebook',{session:'1237525486886834'} ) );
app.get("/login/callback",passport.authenticate("facebook", {
    successRedirect: "/dashboard",
    failureRedirect: `<h1>Error</h1>`,
    session : true
    }),(req,res,next)=>{
        console.log('Successful')

    }
  );
app.get('/dashboard',(req,res)=>{
    // var private_key = "sk_test_51N00OFSF4sQhzetyF0Pcvc6TvwJo1zeIlj9jevG30po6XMwxbNQGUWLMsQbrPvabbmonpKzoQcuutchDvk2jCAca00QiPsxwAJ";
    res.render('index',{key: publishablekey.trim()}
    )
    
})
app.post('/dashboard',(req,res)=>{
    res.render('index')
})
app.post('/contact',async(req,res)=>{
 const {Name,Email,Subject,Message} = req.body
 try{
    await mainMail(Name,Email,Subject,Message)
    res.send('Message successfully send')
 } catch(error){
    res.send('Message could not be sent')
 } 
 

})
app.post('/payment', function(req, res){
 
    // Moreover you can take more details from user
    // like Address, Name, etc from form
    stripe.customers.create({
        email: req.body.stripeEmail,
        source: req.body.stripeToken,
        name: 'Neha Potdar',
        address: {
            line1: 'TC 9/4 Old MES colony',
            postal_code: '452331',
            city: 'Indore',
            state: 'Madhya Pradesh',
            country: 'India',
        },
       
         
    })
    .then((customer) => {
 
        return stripe.charges.create({
            amount: 10,     // Charging Rs 25
            description: 'Web Development Product',
            currency: 'USD',
            customer: customer.id
        });
    })
    .then((charge) => {
        res.redirect('http://localhost:3000/success.html') // If no error occurs
    })
    .catch((err) => {
        res.redirect('http://localhost:3000/cancel.html')       // If some error occurs
    });
})

app.listen(3000,async()=>{
    await mongoose.connect('mongodb://127.0.0.1:27017/passport_demo' ).then((resolved)=>{
        console.log("Database Connected");
    }).catch((rejected)=>{
        console.log("Database connection unsuccessful");
    });
    console.log('App listening on port 3000')
})