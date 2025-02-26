const User = require('../models/User'); 
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// register controller 

const registerUser = async(req,res)=> {
    try{ 
        const {username, email, password, role} = req.body; 
        const checkExistingUser = await User.findOne({$or: [{username}, {email}]});
        if(checkExistingUser){
            return res.status(404).json({
                success: false, 
                message: `User with the given email or password is already exists!`
            })
        }
        // hash password 
        const salt = await bcrypt.genSalt(10); 
        const hashedPassword = await bcrypt.hash(password, salt) 

        const newlyCreatedUser = new User({
            username ,
            email, 
            password: hashedPassword, 
            role: role || 'user'
        });
        newlyCreatedUser.save()

        if(newlyCreatedUser){
            res.status(201).json({
                success: true, 
                message: 'User created successfully !'
            })
        }else {
            res.status(400).json({
                success: true, 
                message: 'Unable to create User. Please try again !'
            })
        }
    }catch(e){
        console.log(e); 
        res.status(500).json({
            success: false, 
            message: `Something went wrong`
        })
    }
}


// login controller 

const loginUser = async(req, res)=> {
    try{
        const {username, password} = req.body;
        // check is user exists 
        const user =await User.findOne({username});
        if(!user){
            return res.status(404).json({
                success: false, 
                message: 'User doesn"t exists !'
            })
        }
        const isPasswordMatched =await bcrypt.compare(password, user.password);
        if(!isPasswordMatched){
            return res.status(404).json({
                success: false, 
                message: 'Invalid credentials !'
            })
        }
        // create user token 
        const accessToken = jwt.sign({
            userId: user._id,
             username: user.username, 
             role: user.role
        },  process.env.JWT_SECRET_KEY, {expiresIn: '30m'})

        res.status(200).json({
            succcess: true, 
            message: 'User Logged in successfully', 
            accessToken
        })
        
    }catch(e){
        console.log(e); 
        res.status(500).json({
            success: false, 
            message: `Something went wrong`
        })
    }
} 

const changePassword = async(req, res)=> {
    try {
        const userId = req.userInfo.userId; 
        // old & new password 
        const  {oldPassword, newPassword} = req.body;

        const user = await User.findById(userId);

        if(!user){
            return res.status(400).json({
                success: false, 
                message: "User not found !"
            })
        }
        // comparing old passwords
        const isPasswordMatch =await bcrypt.compare(oldPassword, user.password); 

        if(!isPasswordMatch){
           return res.status(400).json({
                success: false, 
                message: 'Old password is not correct'
           })
        }

        // saving new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);
        user.password = hashedPassword;
        user.save();

        return res.status(201).json({
            success: false, 
            message: 'Password changed successfully !' 
        })

    }catch(err){
         res.status(500).json({
            success: false, 
            message: `Something went wrong`
        })
    }
}

module.exports = {registerUser, loginUser, changePassword}