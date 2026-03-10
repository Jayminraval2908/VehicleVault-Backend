const userSchema = require("../models/UserModel");

const bcrypt=require("bcrypt");

const registerUser= async(req,res)=>{
    try {

        const hashedPassword= await bcrypt.hash(req.body.password, 10)
        const savedUser= await userSchema.create({...req.body, password:hashedPassword})
        res.status(201).json({
            message:"User Created Successfully",
            data:savedUser
        })
        
    } catch (err) {
        res.status(500).json({
            message:"Error while creating user",
            err:err
        })
    }
}

module.exports = {
    registerUser
}