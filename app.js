const express = require('express');
const path = require('path');
const session=require('express-session')
const moongose = require('mongoose');
const app = express();
const passport=require('passport')
const morgan = require("morgan")
const bodyParser=require("body-parser")
require('./controllers/usercontroller/googleAuth')// Ensure Passport config is loaded

// Session middleware
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
}));


app.use(bodyParser.urlencoded({extended:true}))
// app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static('public'));
app.use(express.static('uploads'));
// Connect to MongoDB
const moongoUrl='mongodb://localhost:27017/fruitable';
moongose.connect(moongoUrl)
.then(()=>{
    console.log("mongodb connected")
})
.catch(()=>{
    console.log("mongodb not connected")
})


// Set the view engine to EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


app.use(express.json())
// Middleware for parsing request bodies
app.use(express.urlencoded({ extended: true }));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

app.use(morgan(':method :url :status :res[content-length] - :response-time ms'));

// Import and use routes
const UserAuth = require('./routes/userRoutes/UserAuth');
const adminAuth=require('./routes/adminRoutes/adminAuth')
app.use('/', UserAuth);
app.use('/admin',adminAuth)

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Running.... http://localhost:${PORT}`);
});
