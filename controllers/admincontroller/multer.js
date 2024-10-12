const multer=require('multer')
const path=require("path")

const storage = multer.diskStorage({
    destination:(req,file,cb)=>{
        cb(null, 'uploads/images');  // Directory to store uploaded images
    },
    filename:(req,file,cb)=>{
        cb(null, Date.now() + '-' + file.originalname); // Unique file names
    }
  })
  // File upload validation (only images)
  const fileFilter=(req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
        cb(null, true); // Corrected from cd to cb
    } else {
        cb(new Error('Only image files are allowed'), false);
    }
  };
  const upload = multer({ 
    storage: storage,
    fileFilter: (req, file, cb) => {
        // Accept only image files
        const fileTypes = /jpeg|jpg|png|gif/;
        const extName = fileTypes.test(path.extname(file.originalname).toLowerCase());
        const mimeType = fileTypes.test(file.mimetype);
  
        if (extName && mimeType) {
            return cb(null, true);
        } else {
            cb(new Error('Only images are allowed!'));
        }
    }
  });
  
  // Middleware for handling image uploads (assuming "croppedImages[]" is the field name)
  const uploadMultipleImages = upload.array('croppedImages[]', 10);  // Accept up to 10 images

  module.exports=uploadMultipleImages