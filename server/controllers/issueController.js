const Issue = require('../models/Issue');
const aiService = require('../services/aiService');
exports.createIssue = async (req, res) => {
    try {
        const { title, description, location, images, voiceNote } = req.body;

        // AI Analysis
        const aiAnalysis = await aiService.analyzeIssue(title, description);

        // Duplicate Detection Logic
        let isDuplicate = false;
        let originalIssueId = null;
        let priorityScore = aiAnalysis.priority_score;

        if (location && location.lat && location.lng) {
            // Find issues within ~50 meters (0.0005 degrees approx)
            const nearbyIssues = await Issue.find({
                category: aiAnalysis.category,
                status: { $in: ['pending', 'in-progress'] },
                'location.lat': { $gt: location.lat - 0.0005, $lt: location.lat + 0.0005 },
                'location.lng': { $gt: location.lng - 0.0005, $lt: location.lng + 0.0005 }
            });

            if (nearbyIssues.length > 0) {
                isDuplicate = true;
                originalIssueId = nearbyIssues[0]._id;
                priorityScore = 0; // Lower priority for duplicate
                console.log('Duplicate issue detected linking to:', originalIssueId);
            }
        }

        const newIssue = new Issue({
            title,
            description,
            category: aiAnalysis.category,
            location,
            images,
            voiceNote,
            priorityScore,
            department: aiAnalysis.department,
            user: req.user.id,
            isDuplicate,
            originalIssueId
        });

        const issue = await newIssue.save();

        // Send Email Confirmation
        const User = require('../models/User');
        const user = await User.findById(req.user.id);
        if (user) {
            const emailService = require('../services/emailService');
            emailService.sendIssueConfirmation(user.email, issue);
        }

        res.json(issue);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.getIssues = async (req, res) => {
    try {
        const issues = await Issue.find().sort({ createdAt: -1 }).populate('user', ['name']);
        res.json(issues);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.upvoteIssue = async (req, res) => {
    try {
        const issue = await Issue.findById(req.params.id);

        // Check if already upvoted
        if (issue.upvotes.includes(req.user.id)) {
            return res.status(400).json({ msg: 'Issue already upvoted' });
        }

        issue.upvotes.push(req.user.id);

        // Simple priority boost logic
        issue.priorityScore += 1;

        await issue.save();

        res.json(issue.upvotes);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
