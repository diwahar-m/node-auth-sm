const express = require('express');
const authMiddleware = require('../middleware/auth-middleware');
const adminMiddleware = require('../middleware/admin-middleware');
const uploadMiddleware = require('../middleware/upload-middleware');
const { uploadImageController} = require('../controllers/image-controller.js')

const router = express.Router(); 

// upload image
router.post('/upload',authMiddleware, adminMiddleware, uploadMiddleware.single('image') , uploadImageController )


// get all image


module.exports = router;
