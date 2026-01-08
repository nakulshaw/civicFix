const express = require('express');
const router = express.Router();
const Complaint = require('../models/Complaint');
const { analyzeComplaint } = require('../lib/geminiAgent');
const multer = require('multer');
const path = require('path');

// Configure Multer Storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)); // Append extension
    }
});

const upload = multer({ storage: storage });

// Get all complaints (Feed)
router.get('/', async (req, res) => {
    try {
        const complaints = await Complaint.find().sort({ date: -1 });
        res.json(complaints);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// Create Complaint (with Image Upload)
router.post('/', upload.single('image'), async (req, res) => {
    const { title, description, location, userId } = req.body;
    let imageUrl = '';

    if (req.file) {
        // Construct full URL (assuming server runs on localhost:5000)
        // In production, use env var for BASE_URL
        imageUrl = `http://localhost:5000/uploads/${req.file.filename}`;
    }

    try {
        // AI Analysis
        // TODO: Ideally pass image to Gemini Vision if available, for now just text
        const analysis = await analyzeComplaint(title, description);

        const newComplaint = new Complaint({
            user: userId !== 'null' ? userId : null, // Handle 'null' string from FormData
            title,
            description,
            location,
            imageUrl,
            category: analysis.category,
            priority: analysis.priority,
            department: analysis.department,
            isEmergency: analysis.isEmergency,
            aiAnalysis: analysis
        });

        const complaint = await newComplaint.save();
        res.json(complaint);

        if (complaint.isEmergency) {
            console.log("🚨 EMERGENCY TRIGGERED: " + complaint.title);
        }

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Upvote Complaint
router.post('/upvote/:id', async (req, res) => {
    try {
        const complaint = await Complaint.findById(req.params.id);
        // Check if user already upvoted (skipped for MVP simplicity)
        // complaint.upvotes.push(req.user.id);

        // Simple heuristic: Upvotes increase priority
        // In real app, we'd check logic

        await complaint.save();
        res.json(complaint);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

module.exports = router;
