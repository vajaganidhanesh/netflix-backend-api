const express = require('express');
const movieModel = require('../models/movie-model')
const fs = require('fs');
const router = express.Router();
const verifyToken = require("../verify-tokens");

// creating the end point
router.post("/",verifyToken,(req,res)=>{
    
    movieModel.create(req.body)
    .then((data)=>{
        res.send({message:"Movie created"});
    })
    .catch((err)=>{
        console.log(err);
        res.send({message:"Some problem"});
    })

})

//  endpoint to fetch all movies

router.get("/",verifyToken,(req,res)=>{
    
        movieModel.find()
        .then((movies)=>{
            res.send(movies);
        })
        .catch((err)=>{
            res.send({message:"some problem..."})
        })
    
})

// to get single movie

router.get("/:id",verifyToken,(req,res)=>{

    let id = req.params.id;
    
    movieModel.findOne({_id:id})
    .then((movie)=>{
        res.send(movie);
    })
    .catch((err)=>{
        res.send({message:"some problem..."})
    })
})

// deleting the existing movies inside the library

router.delete("/:id",verifyToken,(req,res)=>{
    let id = req.params.id;
    movieModel.deleteOne({_id:id})
    .then((movie)=>{
        res.send({message:"Movie deleted"});
    })
    .catch((err)=>{
        res.send({message:"some problem..."})
    })
})

// endpoint to update the movie

router.put("/:id",verifyToken,(req,res)=>{
    let id = req.params.id;
    let data = req.body;

    movieModel.updateOne({_id:id},data)
    .then((movie)=>{
        res.send({message:"Movie updated"})
    })
    .catch((err)=>{
        res.send({message:"some problem"})
    })
})

// endpoint for playing movie

let playid = null;
let filePath = null; 
 

router.get('/stream/:id',async (req,res)=>{

    console.log("request incoming");
    
    // const filename = req.params.filename
    const range = req.headers.range;

    if(playid===null || playid!==req.params.id)
    {
        console.log("only one once");
        playid=req.params.id;
        let movie =await movieModel.findOne({_id:playid})
        filePath=movie.filePath;
        console.log(playid);
    }
    if(!range)
    {
        res.send({message:'please the range header'})
    }

    const videoSize = fs.statSync("./"+filePath).size;
    console.log(videoSize);
    const start = Number(range.replace(/\D/g,""));

    const end = Math.min(start+10**6,videoSize-1);

    const contentLength = end-start;

    let headers={
        "Content-Range":`bytes ${start}-${end}/${videoSize}`, 
        "Accept-Ranges":"bytes",
        "Content-Length":contentLength,
        "Content-Type":"video/mp4"
    }

    res.writeHead(206,headers);

    const videoReadStream = fs.createReadStream("./"+filePath,{start,end});
    console.log("./"+filePath); 
    videoReadStream.pipe(res);
    // console.log(res);
})
module.exports=router