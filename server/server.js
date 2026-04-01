require("dotenv").config({ path: require("path").join(__dirname, ".env") });
const express = require("express");
const path = require("path");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const { MongoClient } = require("mongodb");
const bodyParser = require("body-parser");

const app = express();
const PORT = process.env.PORT || 3000;

const mongoUrl = process.env.MONGO_URL;
if (!mongoUrl) {
  console.error("FATAL: MONGO_URL environment variable is not set.");
  process.exit(1);
}

// Security headers
app.use(helmet());

// Restrict CORS to allowed origins
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",")
  : ["http://localhost:8080"];

app.use(cors({ origin: allowedOrigins, credentials: true }));

app.use(bodyParser.json());

// Rate limiting — max 100 requests per 15 minutes per IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

const client = new MongoClient(mongoUrl);

async function connectToMongo() {
  try {
    await client.connect();
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error("Failed to connect to MongoDB", err);
  }
}

// Route to fetch data
app.get("/data", async (_req, res) => {
  try {
    const database = client.db("dataMarketPlace");
    const collection = database.collection("dataNodes");
    const data = await collection.find({}).toArray();
    res.json(data);
  } catch (err) {
    console.error("Error fetching data:", err);
    res.status(500).json({ error: "Error fetching data" });
  }
});

// Route to add a node
app.post("/data", async (req, res) => {
  try {
    const { name, description, parent } = req.body;
    if (!name) return res.status(400).json({ error: "Name is required" });
    const database = client.db("dataMarketPlace");
    const collection = database.collection("dataNodes");
    const result = await collection.insertOne({
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

// Route to update a node
app.put("/data/:id", async (req, res) => {
  try {
    const { ObjectId } = require("mongodb");
    const { name, description } = req.body;
    const database = client.db("dataMarketPlace");
    const collection = database.collection("dataNodes");
    await collection.updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { name, description } }
    );
    res.json({ success: true });
  } catch (err) {
    console.error("Error updating node:", err);
    res.status(500).json({ error: "Error updating node" });
  }
});

// Route to delete a node
app.delete("/data/:id", async (req, res) => {
  try {
    const { ObjectId } = require("mongodb");
    const database = client.db("dataMarketPlace");
    const collection = database.collection("dataNodes");
    await collection.deleteOne({ _id: new ObjectId(req.params.id) });
    res.json({ success: true });
  } catch (err) {
    console.error("Error deleting node:", err);
    res.status(500).json({ error: "Error deleting node" });
  }
});

// Serve static files using static middleware
app.use(express.static("dist"));

// Catch all route
app.get("*", (_req, res) => {
  res.sendFile(path.resolve(__dirname, "dist", "index.html"));
});

// Start server
app.listen(PORT, async () => {
  await connectToMongo();
  console.log(`Server running at http://localhost:${PORT}`);
});
