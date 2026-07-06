const express = require('express');
const router = express.Router();
const chatService = require('../services/chatService');
const employeeService = require('../services/employeeService');

/**
 * GET /api/history
 * Returns the logged-in user's past messages (up to 50)
 * and basic user info (name + designation) for the UI top bar.
 */
router.get('/', async (req, res) => {
  try {
    const { id: userId, email } = req.user;
    const messages = await chatService.getRecentMessages(userId, 'all', 50);
    const employee = employeeService.getByEmail(email);

    res.json({
      messages,
      user: employee
        ? { name: employee.name, designation: employee.designation }
        : null,
    });
  } catch (err) {
    console.error('History error:', err);
    res.status(500).json({ error: 'Failed to fetch chat history' });
  }
});

/**
 * DELETE /api/history/:id
 * Deletes a specific user message and its corresponding assistant response.
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id: userId } = req.user;
    const { id: sessionId } = req.params;

    await chatService.deleteSession(userId, sessionId);

    res.json({ success: true });
  } catch (err) {
    console.error('Delete history error:', err);
    res.status(500).json({ error: 'Failed to delete chat history' });
  }
});

module.exports = router;
