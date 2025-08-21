# 🍎 Fruitables – Online Fruits & Vegetables Store

**Fruitables** is an e-commerce platform for fresh fruits and vegetables that allows customers to order produce online and shop owners to manage orders digitally. The platform simplifies online ordering and enhances the customer shopping experience while providing shop owners with a comprehensive admin dashboard.

---

## 🛒 Key Features

- **Seamless Online Ordering:** Customers can browse products, add items to their cart or wishlist, and place orders through an intuitive interface.  
- **Secure Payment Options:** Supports **Razorpay** and **Cash on Delivery**, with a **24-hour return policy** for perishable items.  
- **Admin Dashboard:** Allows managing products, processing orders, handling user requests, and generating daily/weekly/monthly sales reports.  
- **User Authentication & Security:** Includes sessions-based authentication, password hashing with **bcrypt**, and secure image uploads via **Multer** and **Cloudinary**.  
- **Order Tracking:** Customers can track order status and history.  
- **MVC Architecture:** Clean separation of concerns for maintainable and scalable code.

---

## ⚙️ Technologies Used

- **Backend:** Node.js, Express.js, MongoDB  
- **Frontend:** EJS, Bootstrap, JavaScript  
- **Payment & Security:** Razorpay, Sessions, bcrypt, Passport.js, Google OAuth  
- **File Uploads:** Multer, Cloudinary  
- **HTTP Requests:** Axios  
- **Deployment & Server:** NGINX  
- **Architecture:** MVC (Model-View-Controller)

---

## 📦 Installation & Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/siyadMuhsin/fruitables.git
   cd fruitables
2. Install dependencies:
   ```bash
    npm install  

3. Configure environment variables in a .env file:
    ```bash
    PORT=3000
    MONGO_URI=<your-mongodb-uri>
    RAZORPAY_KEY=<your-razorpay-key>
    CLOUDINARY_CLOUD_NAME=<cloud-name>
    CLOUDINARY_API_KEY=<api-key>
    CLOUDINARY_API_SECRET=<api-secret>
    SESSION_SECRET=<your-session-secret> 
4. Start the application:
```bash
    npm start