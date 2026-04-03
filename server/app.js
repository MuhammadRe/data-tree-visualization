const express = require("express");
const path = require("path");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const { MongoClient, ObjectId } = require("mongodb");
const bodyParser = require("body-parser");

const app = express();

app.use(helmet());

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",")
  : ["http://localhost:8080"];

app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(bodyParser.json());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

let collection;

async function connectToMongo(mongoUrl) {
  const client = new MongoClient(mongoUrl);
  await client.connect();
  collection = client.db("dataMarketPlace").collection("dataNodes");
}

function setCollection(col) {
  collection = col;
}

function getCollection() {
  return collection;
}

app.get("/data", async (_req, res) => {
  try {
    const data = await getCollection().find({}).toArray();
    res.json(data);
  } catch (err) {
    console.error("Error fetching data:", err);
    res.status(500).json({ error: "Error fetching data" });
  }
});

app.post("/data", async (req, res) => {
  try {
    const { name, description, parent } = req.body;
    if (!name) return res.status(400).json({ error: "Name is required" });
    const result = await getCollection().insertOne({
      name,
      description: description || "",
      parent: parent || "",
    });
    res.json({ _id: result.insertedId, name, description, parent });
  } catch (err) {
    console.error("Error adding node:", err);
    res.status(500).json({ error: "Error adding node" });
  }
});

app.put("/data/:id", async (req, res) => {
  try {
    const { name, description } = req.body;
    await getCollection().updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { name, description } }
    );
    res.json({ success: true });
  } catch (err) {
    console.error("Error updating node:", err);
    res.status(500).json({ error: "Error updating node" });
  }
});

app.delete("/data/:id", async (req, res) => {
  try {
    await getCollection().deleteOne({ _id: new ObjectId(req.params.id) });
    res.json({ success: true });
  } catch (err) {
    console.error("Error deleting node:", err);
    res.status(500).json({ error: "Error deleting node" });
  }
});

app.use(express.static("dist"));

app.get("*", (_req, res) => {
  res.sendFile(path.resolve(__dirname, "dist", "index.html"));
});

module.exports = { app, connectToMongo, setCollection };
