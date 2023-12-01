import express from "express";
import mongoose from "mongoose";

const app = express();
const port = 3000;

// Define your Mongoose schema and model here
const userSchema = new mongoose.Schema({
  name: String,
  email: String
});

const User = mongoose.model('User', userSchema);

// Connect to MongoDB
mongoose.connect("mongodb+srv://saurabhdeshmukh267:5KJdDUbWW67kdMr7@cluster0.xbqodj5.mongodb.net/?retryWrites=true&w=majority")
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
  });

// Set up your routes or middleware here

// Example route
app.get('/', (req, res) => {
  res.send('Hello, Express!');
});

// Start the Express server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
