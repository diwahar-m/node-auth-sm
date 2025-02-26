const Image = require('../models/Image');
const {uploadToCloudinary} = require('../helpers/cloudinaryHelper');
const fs = require('fs');
const cloudinary = require("../config/cloudinary")


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

        res.status(201).json({
            success: true, 
            message: 'Image uploaded successfully', 
            image: newlyUploadedImage
        })

        // deleting file from local storage 
        fs.unlinkSync(req.file.path)
    }catch(err){
        console.log(err); 
        res.status(500).json({
            success: false, 
            message: 'Something went wrong!'
        })
    }
}

const fetchImagesController =async(req, res)=> {
    try{
        // filtering by pages 
            const page = req.query.page || 1;
            const limit = req.query.limit || 5; // no. of items to show in a single page
            const skip = page > 5 ? page -1 * limit : 0 ; // no. of items to skip to go to particular page
            console.log("skip", skip)
            const sortBy = req.query.sortBy || 'creaedAt';
            const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1 ;
            const totalImages = await Image.countDocuments(); 
            const totalPages = Math.ceil(totalImages / limit);

            const sortObj ={};
            sortObj[sortBy] = sortOrder;

        
        const images =await Image.find().sort(sortObj).skip(skip).limit(limit);
        if(images){
            return res.status(201).json({
                success: true, 
                currentPage: page, 
                totalPages: totalPages, 
                totalImages: totalImages,
                data: images
            })
        }
    }catch(err){
        console.log(err); 
        res.status(500).json({
            success: false, 
            message: 'Something went wrong!'
        })
    }
}

const deleteImageController = async(req, res) => {
    try {
        const imageIdToBeDeleted = req.params.id; 
        const userId = req.userInfo.userId; 
        const image  = await Image.findById(imageIdToBeDeleted);
        if(!image){
            return res.status(404).json({
                success: false, 
                message: 'Image not found !'
            })
        }
        // checking if image uploader and this user are same. 
        if(image?.uploadedBy.toString() !== userId){
            return res.status(403).json({
                success: false,
                message: 'You are not authorized to delete the image'
            })
        }

        // delete image in the cloudinary 
        await cloudinary.uploader.destroy(image.publicId);
        // delete image in the mongodb 
        await Image.findByIdAndDelete(imageIdToBeDeleted);

        res.status(200).json({
            success: false, 
            message: 'Image Deleted successfully !'
        })


    }catch(err){
        console.log(err);
        res.status(500).json({
            success: false,
            message: 'Something went wrong!'
        })
    }
}

module.exports = {uploadImageController,fetchImagesController, deleteImageController}