const User = require('../models/User'); 
const bcrypt = require('bcryptjs');
const jwt = rquire('jsowebtoken')

// register conntroller 

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
        const user = User.findOne({username});
        if(!user){
            return res.status(404).json({
                success: false, 
                message: 'Invalid credentials !'
            })
        }
        const isPasswordMatched = bcrypt.compare(password, user.password);
        if(!isPasswordMatched){
            return res.status(404).json({
                success: false, 
                message: 'Invalid credentials !'
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

module.exports = {registerUser, loginUser}