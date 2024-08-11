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

async function run() {
    try {
      // Connect the client to the server	(optional starting in v4.7)
      // await client.connect();
  
      const database = client.db("libraryManage");
      const brandCollection = database.collection("categories");
      const teamCollection = database.collection("team");
      const bookCollection = database.collection("book");
      const cartCollection = database.collection("cart");
      const reviewCollection = database.collection("review");
    

         // get the categories 
    app.get('/category', async(req,res) =>{
     

const cursor = brandCollection.find()
  const result = await cursor.toArray()
  res.send(result)
    })

    // get the dynamic id for brand crategories
app.get('/category/:id', async(req,res) =>{
  const id = req.params.id;
  const query = {_id: new ObjectId(id)}
  const result = await brandCollection.findOne(query)
  res.send(result)
})

    // get the team
    app.get('/team', async(req,res) =>{
const cursor = teamCollection.find()
  const result = await cursor.toArray()
  res.send(result)
    })

    // create book data
app.post('/book', verifyToken, async(req,res) =>{
    
  const newbook = req.body;
  console.log(newbook)
 
  const result = await bookCollection.insertOne(newbook);
  res.send(result)
})
// get book data
app.get('/book', async(req,res) =>{

  // for filter data
  let queryOb={}
  const type = req.query.type;
  if(type){
    queryOb.type = type
  }

  // // pagination 
  const page = Number(req.query.page);
  const limit = Number(req.query.limit);
  const skip = (page - 1)* limit;
  const cursor = bookCollection.find(queryOb).skip(skip).limit(limit)
  const result = await cursor.toArray()

  // count data
  const total = await bookCollection.countDocuments()
  res.send({
    total,result
  })
})

// get id for book data update
app.get('/book/:id',  async(req,res) =>{
  const id = req.params.id;
  const query = {_id: new ObjectId(id)}
  const result = await bookCollection.findOne(query)
  res.send(result)
})
// for all books data update
app.put('/book/:id', async(req,res) =>{
  const id = req.params.id;
  const filter = { _id: new ObjectId(id)}
  const options = {upsert: true}
  const updateproduct = req.body;
  const product ={
    $set: {
      name : updateproduct.name,
      quantity : updateproduct.quantity,
      photo : updateproduct.photo,
      type : updateproduct.type,
      des : updateproduct.des,
      author : updateproduct.author,
      rating : updateproduct.rating
    
    }
  }
  const result = await bookCollection.updateOne(filter,product,options)
  res.send(result)
})

// review book
app.get('/review/:id', async(req,res) =>{
  const id = req.params.id;
  const query = {_id: new ObjectId(id)}
  const result = await bookCollection.findOne(query)
  res.send(result);
})

// post review
app.post('/reviews', async(req,res) =>{
  const reviews = req.body;
  const result = await reviewCollection.insertOne(reviews);
  res.send(result);
})

// get the review
app.get('/allReviews', async(req,res) =>{
  const cursor = reviewCollection.find()
  const result = await cursor.toArray()
  res.send(result)
})

// creat cart data for user
app.post('/cart', async(req,res) =>{
   const borrow = req.body;

   const existingItem = await cartCollection.findOne({ _id: borrow._id });

   if (existingItem) {
     return res.status(400).json({ error: 'Item already exists in the cart' });
   }

   await bookCollection.updateOne(
    { _id: borrow._id },
    { $inc: { quantity: -1 } }
  );

  // Add the book to the cart
  const result = await cartCollection.insertOne(borrow);
  res.send(result);

})


// get the cart data and verify user
// localhost:5000/cart
app.get('/cart', verifyToken, async(req, res) => {
 
  // console.log(req.query.email)
  if(req.user?.email !== req.query?.email){

    return res.status(403).send({message: "Access forbidden"})
  }
  let query ={}
  if(req?.query?.email){
    query= {email: req?.query?.email}
  }
  const cursor = cartCollection.find(query);
  const result = await cursor.toArray();
  res.send(result);
});

// delete item from cart
app.delete('/cart/:id', verifyToken, async(req,res) =>{
  const id = req.params.id;
  const query = { _id: new ObjectId(id)};
  const result= await cartCollection.deleteOne(query)
  res.send(result)
})

// get the each id for get the cart item to cart
app.get('/cart/:id', async(req,res) =>{
  const id = req.params.id;
  const query = { _id: new ObjectId(id)}
  const result = await cartCollection.findOne(query)
  res.send(result)
  console.log(result)
})

// jwt 
app.post('/jwt', async(req,res) =>{
  const user = req.body;
  console.log(user)
  const token = jwt.sign(user, process.env.ACCES_TOKEN, {expiresIn: '10h'})
  res
  res
      .cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', 
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',

    })
  .send({success: true})
  
})

// logout user
app.post('/logOut', async(req,res) =>{
    const user = req.body;
    res.clearCookie('token', {maxAge: 0, httpOnly: true,
      secure: process.env.NODE_ENV === 'production', 
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict', }
    )
    .send({success: true})
})






  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})