require('dotenv').config();
const path = require('path');
const express = require('express');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 3000;

// Use your full connection string here
const MONGODB_URI = process.env.MONGO_URI;

const Task = require('./models/Task');

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB successfully');
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });
// GET all tasks
app.get('/api/tasks', async (req, res) => {
    const tasks = await Task.find();
    res.json(tasks);
});

// POST a new task
app.post('/api/tasks', async (req, res) => {
    const newTask = new Task(req.body);
    const savedTask = await newTask.save();
    res.json(savedTask);
});
// PATCH to update task status
app.patch('/api/tasks/:id', async (req, res) => {
    try {
        const updatedTask = await Task.findByIdAndUpdate(
            req.params.id, 
            { status: req.body.status }, 
            { returnDocument: 'after'}
        );
        res.json(updatedTask);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});