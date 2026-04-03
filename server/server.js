require("dotenv").config({ path: require("path").join(__dirname, ".env") });
const { app, connectToMongo } = require("./app");

const PORT = process.env.PORT || 3000;

const mongoUrl = process.env.MONGO_URL;
if (!mongoUrl) {
  console.error("FATAL: MONGO_URL environment variable is not set.");
  process.exit(1);
}

app.listen(PORT, async () => {
  await connectToMongo(mongoUrl);
  console.log(`Server running at http://localhost:${PORT}`);
});
