const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { connectToDB, getDB } = require('./db');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

let db;

// Connect to MongoDB
connectToDB((err) => {
  if (err) {
    console.error('❌ DB connection error:', err);
    return;
  }
  db = getDB();
  app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
});

// POST /create-test
app.post('/create-test', async (req, res) => {
  const { collectionName } = req.body;
  try {
    const collection = db.collection(collectionName);
    await collection.insertMany([
      { name: 'Alice', score: 0 },
      { name: 'Bob', score: 0 },
      { name: 'Charlie', score: 0 }
    ]);
    res.json({ message: `Test collection '${collectionName}' created.` });
  } catch (err) {
    res.status(500).json({ error: 'Collection creation failed.' });
  }
});

// GET /get-students
app.get('/get-students', async (req, res) => {
  const { collection } = req.query;
  try {
    const data = await db.collection(collection).find({}, { projection: { name: 1, _id: 0 } }).toArray();
    const names = data.map((item) => item.name);
    res.json({ names });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve student names.' });
  }
});
