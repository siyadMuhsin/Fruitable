const { check, validationResult } = require('express-validator')
const httpStatus=require('../../types/HTTP_STATUS')
const validateCategory = [
    check('name')
        .isLength({ min: 3, max: 50 })
        .withMessage('Category name must be between 3 and 50 characters.')
        .matches(/^[a-zA-Z0-9 ]+$/)
        .withMessage('Category name must be alphanumeric.'),
    check('description')
        .optional()
        .isLength({ max: 200 })
        .withMessage('Description cannot exceed 200 characters.'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(httpStatus.BAD_REQUEST).json({ errors: errors.array() });
        }
        next(); // Proceed to the next middleware/controller
    }
];

const adminAuthenticate=(req,res,next)=>{
    if(req.session && req.session.adminId){
       
        return next() // User is authenticated, proceed to the next middleware or route handler
    }else{
        return res.redirect('/admin/')// User is not authenticated, redirect to login
    }
   
 
}



module.exports = {
    validateCategory,
    adminAuthenticate
}