const express = require('express');
const path = require('path');
const session=require('express-session')
const connectDB=require('./config/dbConfig')
const app = express();
const passport=require('passport')
const morgan = require("morgan")

require('./controllers/usercontroller/googleAuth')// Ensure Passport config is loaded

// Session middleware
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
}));

app.use(express.static('public'));
app.use(express.static('uploads'));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.json())
app.use(express.urlencoded({ extended: true }));

app.use(passport.initialize());
app.use(passport.session());
app.use(morgan(':method :url :status :res[content-length] - :response-time ms'));

// Import and use routes
const UserAuth = require('./routes/userRoutes/UserAuth');
const adminAuth=require('./routes/adminRoutes/adminAuth')
app.use('/', UserAuth);
app.use('/admin',adminAuth)

connectDB();
// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Running.... http://localhost:${PORT}`);
});
