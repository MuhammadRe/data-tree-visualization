const express = require("express");
const path = require("path");
const cors = require("cors");
const { MongoClient } = require("mongodb");
const bodyParser = require("body-parser");

const app = express();
const PORT = process.env.PORT || 3000 // Fallback to 3000 for local development;

const mongoUrl = "mongodb+srv://muhammadalreffaai:Q1w2e3r4t5@cluster0.edv7j3b.mongodb.net/";

app.use(bodyParser.json());

// Enable all CORS requests
app.use(cors());

const client = new MongoClient(mongoUrl);

//Connect to MongoDB
async function connectToMongo() {
    try {
        await client.connect();
        console.log('Connected to MongoDB');
    } catch (err) {
        console.error('Failed to connect to MongoDB', err);
    }
};

// Route to fetch data
app.get('/data', async (req, res) => {
    try {
      const database = client.db("dataMarketPlace");
      const collection = database.collection("dataNodes");
      const data = await collection.find({}).toArray();
      res.json(data);
    } catch (err) {
      res.status(500).send("Error fetching data");
    }
});

// Serve static files using static middleware
app.use(express.static('dist'));

// Catch all route
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
});

// Start server
app.listen(PORT, async () => {
  await connectToMongo();
  console.log(`Server running at http://localhost:${PORT}`);
});

  