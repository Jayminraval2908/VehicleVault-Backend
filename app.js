const express = require("express");

const app = express();

const cors = require("cors")
require("dotenv").config()

app.use(express.json())
app.use(cors())


const userRoutes = require("./src/routes/UserRoutes")
app.use("/user",userRoutes)

const DBConnection = require("./src/utills/DBConnection")
DBConnection()
const PORT= process.env.PORT
app.listen(PORT,()=>{
    console.log(`Server is connected successfully on port ${PORT}`)
})