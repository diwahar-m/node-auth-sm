const Image = require('../models/Image');
const {uploadToCloudinary} = require('../helpers/cloudinaryHelper');

const uploadImageController = async(req, res)=> {
    try{
        // if file is missing 
        if(!req.file){
            return res.status(400).json({
                success: false, 
                message: 'File is required.'
            })
        }
        console.log("FILE----", req.file)
        // upload to cloudinary 
        const {url, publicId} = await uploadToCloudinary(req.file.path);
        // storing in db
        const newlyUploadedImage = new Image({
            url,
            publicId,
            uploadedBy: req.userInfo.userId
        })
        await newlyUploadedImage.save();

        res.status(200).json({
            success: true, 
            message: 'Image uploaded successfully', 
            image: newlyUploadedImage
        })
    }catch(err){
        console.log(err); 
        res.status(500).json({
            success: false, 
            message: 'Something went wrong!'
        })
    }
}

module.exports = {uploadImageController}