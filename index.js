// server.js
require("dotenv").config();
const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());

// MongoDB connection
const uri = process.env.DATABASE_URI;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

let expensesCollection;

async function run() {
  try {
    await client.connect();
    const db = client.db("e-wallet"); // DB Name
    expensesCollection = db.collection("expenses"); // Collection Name

    console.log("Connected to MongoDB");

    // Start server
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error(err);
  }
}

run().catch(console.dir);
