const express = require('express');
const app = express();
const port = 5000; // Choose a different port than the React default (3000)

// Middleware to parse JSON bodies
app.use(express.json());

// Basic test route
app.get('/', (req, res) => {
  res.send('Backend Server is Running!');
});

app.listen(port, () => {
  console.log(`Backend server listening at http://localhost:${port}`);
});