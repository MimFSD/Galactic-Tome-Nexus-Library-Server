const express = require('express')
const cors = require('cors')
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser')
require('dotenv').config()
const app = express()
const port = process.env.PORT || 5000


// middelware
app.use(cors(
  {
    origin: [
      'http://localhost:5173',
      'https://library-management-7f05c.web.app',
      'https://library-management-7f05c.firebaseapp.com'
     ],
    credentials: true
  }
))
app.use(express.json())
app.use(cookieParser())


// verify token
const verifyToken = async(req,res,next) =>{
  const token = req.cookies?.token;
  if(!token){
    return res.status(401).send({message: "unauthorized access"})
  }
  jwt.verify(token, process.env.ACCES_TOKEN, (err,decode) => {

    if(err){
      return res.status(401).send({message: "unauthorized access"})
    }
    req.user = decode;
    next();
  })
}