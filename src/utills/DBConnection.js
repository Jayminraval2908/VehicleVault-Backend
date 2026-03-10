const mongoose = require("mongoose")
require("dotenv").config();

const DBConnection =()=>{
    mongoose.connect(process.env.DB_URL).then(()=>{
        console.log("Database is connected....")
    }).catch((err)=>{
        console.log(err)
    })
}

module.exports = DBConnection;