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
   //issueBooks post
   app.post("/issueBook", (req, res) => {
    const issueBook = req.body;
    console.log("Issue Book", issueBook);
    issueBooksCollection.insertOne(issueBook).then((result) => {
      console.log("Book Issue ", result.acknowledged);
      res.send(result.acknowledged > 0);
    });
  });

   // Department books
   app.post("/booksByDepartment", (req, res) => {
    // console.log(req);
    const department = req.body.departmentName;
    
    booksCollection.find({ department }).toArray((err, books) => {
      // console.log("books", books);
      res.send(books);
    });
  });

  //add admin
  app.post("/addLibrarian", (req, res) => {
    const librarian = req.body;
    librarianCollection.insertOne(librarian).then((result) => {
      console.log("librarian ", result.acknowledged);
      res.send(result.acknowledged > 0);
    });
  });

    //update issue book
    app.patch("/update/:id", (req, res) => {
        const id = ObjectID(req.params.id);
        issueBooksCollection
          .updateOne(
            { _id: id },
            {
              $set: {
                bookName: req.body.bookName,
                department: req.body.department,
                issueDate: req.body.issueDate,
                returnDate: req.body.returnDate,
                roll: req.body.roll,
                semester: req.body.semester,
                studentName: req.body.studentName,
              },
            }
          )
          .then((result) => {
            console.log("Update", result);
            res.send(result.matchedCount > 0);
          });
      });