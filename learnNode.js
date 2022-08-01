import { MongoClient } from "mongodb";
import http from 'http';
import express from 'express';
import bodyParser from 'body-parser';
import bcrypt from "bcrypt";
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import mongoose from "mongoose";

const uri = process.env.uri;
const client = new MongoClient(uri);
const port = process.env.PORT || 3000
const app = express()

var jsonParser = bodyParser.json()
dotenv.config();
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "*");
  next();
});

const validateToken = (token) => {
  // Tokens are generally passed in the header of the request
  // Due to security reasons.

  let jwtSecretKey = process.env.JWT_SECRET_KEY;
  try {

      const verified = jwt.verify(token, jwtSecretKey);
      if(verified){
          return true;
      }else{
          // Access Denied
          return false;
      }
  } catch (error) {
      // Access Denied
      return false;
  }
};

app.get('/', (req, res) => {
  run().catch(console.dir);
  async function run() {
    if(validateToken(req.headers.authorization))
    {
      await client.connect();
      try {
        const database = client.db('sample_mflix');
        const movies = database.collection('movies');
        // Query for a movie that has the title 'Back to the Future'
        
        MongoClient.connect(uri, function(err, db) {
          if (err) throw err;
          var dbo = db.db("sample_mflix");
          var query = { genres: ["Action"] };
          dbo.collection("movies").find(query).toArray(function(err, result) {
            if (err) throw err;
            console.log(result);
            res.send(result)
            // db.close();
          });
        });

        // await movies.find(query).toArray(function(err, result) {
        //   if (err) throw err;
        //   res.send(err)
        //   // db.close();
        // });
      //   .toArray(function(e, d) {
      //     console.log(d.length);
      //     db.close();
      // });
        // res.send(movie)
        //console.log(movie);
      } 
      finally {
        // Ensures that the client will close when you finish/error
        await client.close();
      }
    }
    else {
      return res.status(401).send("error");
    }
  }
  //res.send("hello World")
})

app.post('/', jsonParser, async (req, res) => {
      await client.connect();
      const database = client.db('NodeApp');
      const users = database.collection('users');
      const data = req.body;
      const query = req.body['userName'].JSON;
      var message = "User exists!";
      if(!await users.findOne(query)) {
        bcrypt.hash(data.password, 10, async function (err, hash) {
          console.log(hash);
          data.password = hash;
          await users.insertOne(data);
          // Ensures that the client will close when you finish/error
          await client.close();
        });
        message = "New user created!";
      }
      res.send(message);
})

app.post('/login', jsonParser, async (req, res) => {
  await client.connect();
  const database = client.db('NodeApp');
  const users = database.collection('users');
  const data = req.body;
  const query = data['userName'].JSON;
  var message = "Wrong creds!";
  var user = await users.findOne(query);
  await client.close();
  bcrypt.compare(data.password, user.password, function(err, result) {
    if (result && user.userName==data.userName) {
      message = "valid"
        // Create token
      const token = jwt.sign(
        { user_id: user._id, userName: user.userName },
        process.env.JWT_SECRET_KEY,
        {
          expiresIn: "1d",
        }
      );
      // save user token
      res.send(token);
    }
    else {
      res.send(message);
    }
    });
})

app.post('/postData', jsonParser, async (req, res) => {
  await client.connect();
  const database = client.db('NodeApp');
  const users = database.collection('users');
  const data = req.body;
  await users.insertOne(data);
  await client.close();
  res.send(req.body)
})

app.listen(3002)


const server = http.createServer((req, res) => {
  res.statusCode = 200
  res.setHeader('Content-Type', 'text/html')
  run().catch(console.dir);
  async function run() {
    try {
      const database = client.db('sample_mflix');
      const movies = database.collection('movies');
      // Query for a movie that has the title 'Back to the Future'
      const query = { title: 'Back to the Future' };
      const movie = await movies.findOne(query);
      res.end("<h1>"+ JSON.stringify(movie)+"</h1>")
      //console.log(movie);
    } 
    finally {
      // Ensures that the client will close when you finish/error
      // await client.close();
    }
  }
  //res.end()
})

server.listen(port, () => {
  console.log(`Server running at port ${port}`)
})