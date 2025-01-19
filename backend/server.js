// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3001; // Changed to 3001

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/portfolio-builder')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB:', err));

// Portfolio Schema
const portfolioSchema = new mongoose.Schema({
    userId: String,
    title: String,
    description: String,
    skills: [String],
    projects: [{
        title: String,
        description: String,
        githubUrl: String,
    }],
    shareableLink: String
});

const Portfolio = mongoose.model('Portfolio', portfolioSchema);

// Routes
// Create new portfolio
app.post('/api/portfolios', async (req, res) => {
    try {
        const portfolio = new Portfolio(req.body);
        portfolio.shareableLink = `share/${Math.random().toString(36).substr(2, 9)}`;
        await portfolio.save();
        res.status(201).json(portfolio);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get portfolio by ID
app.get('/api/portfolios/:id', async (req, res) => {
    try {
        const portfolio = await Portfolio.findById(req.params.id);
        if (!portfolio) {
            return res.status(404).json({ error: 'Portfolio not found' });
        }
        res.json(portfolio);
    } catch (error) {
        res.status(404).json({ error: 'Portfolio not found' });
    }
});

// Update portfolio
app.put('/api/portfolios/:id', async (req, res) => {
    try {
        const portfolio = await Portfolio.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!portfolio) {
            return res.status(404).json({ error: 'Portfolio not found' });
        }
        res.json(portfolio);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Error handling for port already in use
const server = app.listen(port, () => {
    console.log(`Server running on port ${port}`);
}).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`Port ${port} is already in use. Trying port ${port + 1}`);
        server.close();
        app.listen(port + 1, () => {
            console.log(`Server running on port ${port + 1}`);
        });
    } else {
        console.error('Server error:', err);
    }
});