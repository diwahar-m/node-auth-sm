const mongoose = require('mongoose');

const connectToDb = async()=> {
    try{
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Mongo db connected !')

    }catch(e){
        console.log(`Error connecting  to Db: ${e}`)
    }
}
module.exports = connectToDb
