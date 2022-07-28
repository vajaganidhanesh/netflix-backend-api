const jwt = require('jsonwebtoken');

module.exports =function verifyToken(req,res,next){

    if(req.headers.authorization!==undefined)
    {

        let token = req.headers.authorization.split(" ")[1];

        jwt.verify(token,"secretkey",(err,data)=>{
            console.log(data);

            if(err===null)
            {
                next();
            }
            else
            {
                res.send({message:"invalid token please login again"});
            }
        })
    }
    else
    {

        res.send({message:"please provide headers token"});


    }


}