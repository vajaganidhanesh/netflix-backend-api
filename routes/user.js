const express = require('express');
const bcryptjs = require('bcryptjs');
const jwt = require ('jsonwebtoken')
const nodemailer = require('nodemailer');

// custom module of userModel..
const userModel = require("../models/user-model")
const verifyToken = require("../verify-tokens");
const userMovieModel = require('../models/user-movie-model');

// for routing the components
const router = express.Router();

// mailing head part
const transporter = nodemailer.createTransport({
    // company domain name should be mentioned ... in (service )
    service:"gmail", 
    auth:{
        user:"vajaganichintu@gmail.com",
        pass:"iktsogoiivxvspxt"
    }
})

// end for user registeration/user creation...
router.post("/",(req,res)=>{
    let user = req.body;

    bcryptjs.genSalt(10,(err,salt)=>{

        if(err===null || err ===undefined)
        {
            bcryptjs.hash(user.password,salt,(err,encPass)=>{
                if(err === null || err === undefined)
                {
                    user.password=encPass;

                    userModel.create(user)

                    .then((data)=>{
                        
                        res.send({message:"User Registered successfully"})

                        // mail body part

                        let mailBody = {
                            from:"vajaganichintu@gmail.com",
                            to:user.email,
                            subject:"Testing Email",
                            text:"Hello This is first email",
                            html:`<div style="background-color: lightgray; height: 200px;width: 100%; font-family: Segoe ui; text-align: center;
                            padding:1px 15px">
                            <h4 style="font-weight: 400;padding:0px">CONGRAGULATIONS</h4>
                            <p>You have successfully registered for NOT-FILX</p>
                            <p>${user.email}</P>
                            <p>${user.name}</P>
                            <p>${user.contact}</P>

                            </div>`
                        }
                        
                        transporter.sendMail(mailBody,(error,message)=>{
                            if(!error)
                            {
                                console.log(message);
                                console.log("Email sent");
                            }
                            else
                            {
                                console.log("some issue");
                                console.log(error);
                            }
                        })

                        // end of body part

                    })
                    .catch((err)=>{

                        res.send({message:"Someproblem in creating the user"})

                    })
                }
            })
        }
    })
})


// endpoint for login 

router.post("/login",(req,res)=>{

    let userCred = req.body;

    userModel.findOne({email:userCred.email})
    .then((user)=>{

        if(user!==undefined)
        {
            bcryptjs.compare(userCred.password,user.password,(err,result)=>{
                if(err===null || err===undefined)
                {
                    if(result===true)
                    {
                        jwt.sign(userCred,"secretkey",{expiresIn:"1d"},(err,token)=>{
 
                            if(err===null || err===undefined)
                            {
                                res.send({success:true,token:token,usermail:user.email,user_id:user._id})
                            }
                        })
                    }
                    else
                    {
                        res.send({message:"Invalid user",success:false})
                    }
                }

            })
        }

    })
    .catch((err)=>{
        // console.log(err);
        res.send({message:"Someproblem while login in user"})
    })

})

// endPoint to get single user
router.get("/:id",verifyToken,(req,res)=>{
    userModel.findOne({_id:req.params.id})
    .then((user)=>{
        console.log(user);
        res.send({success:true,message:"successfull",user:user})
    })
    .catch((err)=>{
        console.log(err);
        res.send({success:false,message:"Some Problem while getting user info"})
    })
})


router.post("/play",verifyToken,(req,res)=>{

    const user_movie = req.body;

    userMovieModel.findOne({movie:user_movie.movie,user:user_movie.user})
    .then((data)=>{
       if(data===undefined || data ===null)
       {
            userMovieModel.create(user_movie)
            .then((data)=>{
                res.send({success:true, message:"User movie created",user_movie:data})
            })
            .catch((err)=>{
                res.send({message:"Something wrong while playing the movie"})
            })
       }
       else
       {
        
            res.send({message:"User movie created",success:true,user_movie:data})

       }
    })
    .catch((err)=>{
        console.log(err);
        res.send({message:""})
    })
})


router.put("/closeplayer/:user_movie_id",verifyToken,(req,res)=>{
    let data = req.body;
    let id = req.params.user_movie_id;

    userMovieModel.updateOne({_id:id},data)
    .then((info)=>{
        res.send({message:"Player closed",success:true})
    })
    .catch((err)=>{
        res.send({message:"Some problem while closing the video"})
    })
})


module.exports=router