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

    // 1️ POST /expenses → Add a new expense
    app.post("/expenses", async (req, res) => {
      const { title, amount, category, date } = req.body;

      // Validation
      if (!title || title.length < 3) {
        return res.status(400).json({
          error: "Title is required and must be at least 3 characters long",
        });
      }
      if (amount === undefined || typeof amount !== "number" || amount <= 0) {
        return res.status(400).json({
          error: "Amount is required and must be a number greater than 0",
        });
      }
      if (!date || isNaN(new Date(date).getTime())) {
        return res
          .status(400)
          .json({ error: "Date is required and must be a valid date" });
      }

      const newExpense = { title, amount, category, date: new Date(date) };
      const result = await expensesCollection.insertOne(newExpense);
      res
        .status(201)
        .json({ message: "Expense added successfully", id: result.insertedId });
    });

    // 2️ GET /expenses → Fetch all expenses
    app.get("/expenses", async (req, res) => {
      const expenses = await expensesCollection.find().toArray();
      res.json(expenses);
    });

    // 3️ PATCH /expenses/:id → Update an expense
    app.patch("/expenses/:id", async (req, res) => {
      const { id } = req.params;
      const { title, amount, category, date } = req.body;

      // Partial update validation
      const updateFields = {};
      if (title !== undefined) {
        if (title.length < 3) {
          return res
            .status(400)
            .json({ error: "Title must be at least 3 characters long" });
        }
        updateFields.title = title;
      }
      if (amount !== undefined) {
        if (typeof amount !== "number" || amount <= 0) {
          return res
            .status(400)
            .json({ error: "Amount must be a number greater than 0" });
        }
        updateFields.amount = amount;
      }
      if (category !== undefined) updateFields.category = category;
      if (date !== undefined) {
        if (isNaN(new Date(date).getTime())) {
          return res.status(400).json({ error: "Invalid date format" });
        }
        updateFields.date = new Date(date);
      }

      const result = await expensesCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: updateFields }
      );

      if (result.matchedCount === 0) {
        return res.status(404).json({ error: "Expense not found" });
      }

      res.json({ message: "Expense updated successfully" });
    });

    // 4️⃣ DELETE /expenses/:id → Delete an expense
    app.delete("/expenses/:id", async (req, res) => {
      const { id } = req.params;
      const result = await expensesCollection.deleteOne({
        _id: new ObjectId(id),
      });

      if (result.deletedCount === 0) {
        return res.status(404).json({ error: "Expense not found" });
      }

      res.json({ message: "Expense deleted successfully" });
    });

    // 4️⃣ DELETE /expenses/:id → Delete an expense
    app.delete("/expenses/:id", async (req, res) => {
      const { id } = req.params;
      const result = await expensesCollection.deleteOne({
        _id: new ObjectId(id),
      });

      if (result.deletedCount === 0) {
        return res.status(404).json({ error: "Expense not found" });
      }

      res.json({ message: "Expense deleted successfully" });
    });

    // Start server
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error(err);
  }
}

run().catch(console.dir);
