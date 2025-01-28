const mongoose = require('mongoose');

const mongoURI = "mongodb://localhost:27017/?readPreference=primary&appname=MongoDB%20Compass&directConnection=true&ssl=false";

const connectToMongo = async () => {
    try {
        await mongoose.connect(mongoURI,console.log("The connection is done!"));
    }
    catch(err){
        console.log("Error in conncetion of MongoDB :", err.message);
    }
}

module.exports = connectToMongo;  
