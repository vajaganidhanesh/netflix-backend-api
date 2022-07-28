const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require("dotenv").config();

// custom module imports
const movieRouter = require('./routes/movies');
const userRouter = require('./routes/user')

// creating connection between mongodb and api
mongoose.connect("mongodb://localhost:27017/batch_6_movies_p")
.then(()=>{
    console.log("connection successfull");
})

// creating API using express
const app = express();

// middleware packages 
app.use(express.json());
app.use(cors())

// routing setup
app.use("/movies",movieRouter);
app.use("/users",userRouter);

// starting the server...
app.listen(process.env.PORT || 8000,()=>{
    console.log("server up and running");
})