const express = require('express');
const router = express.Router();
const { createIssue, getIssues, upvoteIssue } = require('../controllers/issueController');
const auth = require('../middleware/auth');

// @route   POST api/issues
// @desc    Create a new issue
// @access  Private
router.post('/', auth, createIssue);

// @route   GET api/issues
// @desc    Get all issues
// @access  Public
router.get('/', getIssues);

// @route   POST api/issues/:id/upvote
// @desc    Upvote an issue
// @access  Private
router.post('/:id/upvote', auth, upvoteIssue);

module.exports = router;
