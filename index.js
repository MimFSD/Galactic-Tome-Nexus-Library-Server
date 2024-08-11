const express = require("express");
const app = express();
const { MongoClient } = require("mongodb");
const ObjectID = require("mongodb").ObjectID;
const cors = require("cors");
require("dotenv").config();

const port = 5000;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.zqlov.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;


  
app.use(cors());
app.use(express.json());

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

client.connect((err) => {
  //Book collection
  const booksCollection = client.db("ist-library").collection("books");  

    // Book Issue collection
    const issueBooksCollection = client
    .db("ist-library")
    .collection("issueBooks");
  // librarian collection
  const librarianCollection = client.db("ist-library").collection("librarian");

   // books get
   app.get("/getBooks", (req, res) => {
    booksCollection.find().toArray((err, books) => {
      res.send(books);
    });
  });

   //issue book get
   app.get("/getIssueBooks", (req, res) => {
    issueBooksCollection.find().toArray((err, issueBooks) => {
      res.send(issueBooks);
    });
  });
  // books post
  app.post("/addBook", (req, res) => {
    const newBook = req.body;
    console.log("new book", newBook);
    booksCollection.insertOne(newBook).then((result) => {
      console.log("Inserted Count ", result.acknowledged);
      res.send(result.acknowledged > 0);
    });
  });