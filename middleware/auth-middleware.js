const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next)=> {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(" ")[1];
    if(!token){
        return res.status(401).json({
            message: 'Access Denied. No token provided. Please login'
        })
    }
    try{
        const decodedTokenInfo = jwt.verify(token, process.env.JWT_SECRET_KEY)
        req.userInfo = decodedTokenInfo
        next();
    }catch(e){
         return res.status(401).json({
            message: 'Access Denied. No token provided. Please login'
        })
    }
}

module.exports = authMiddleware