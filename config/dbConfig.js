const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const mongoUrl =process.env.MONGO_URL;
        await mongoose.connect(mongoUrl, {
        });
        console.log("MongoDB connected successfully");
    } catch (error) {
        console.error("MongoDB connection failed:", error);
        process.exit(1); // Exit process with failure
    }
};

module.exports = connectDB;