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
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ntnzcww.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});