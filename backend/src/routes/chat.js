const express = require('express');
const router = express.Router();
const employeeService = require('../services/employeeService');
const promptBuilder = require('../services/promptBuilder');
const llmService = require('../services/llmService');
const chatService = require('../services/chatService');

/**
 * POST /api/chat
 * Request body: { message: string }
 * Response: { reply: string }
 *
 * Flow follows BACKEND_DB_DESIGN.md §1 exactly:
 * 1. Auth middleware already verified JWT → req.user has { id, email }
 * 2. Look up employee profile by verified email
 * 3. Fetch recent chat history for continuity
 * 4. Build prompt (handbook + employee + rules + history + message)
 * 5. Call Gemini
 * 6. Persist both turns
 * 7. Return reply
 */
router.post('/', async (req, res) => {
  try {
    const { message, sessionId } = req.body;

    if (!message || typeof message !== 'string' || message.trim() === '') {
      return res.status(400).json({ error: 'Message is required' });
    }

    const { id: userId, email } = req.user;

    // Step 2: Look up employee profile by verified email
    const employee = employeeService.getByEmail(email);
    if (!employee) {
      return res.status(403).json({ error: 'Employee profile not found' });
    }

    // Step 3: Get recent chat history for THIS session
    const recentMessages = await chatService.getRecentMessages(userId, sessionId);

    // Step 4: Build prompt
    const { systemPrompt, history, userMessage } = promptBuilder.build(
      employee,
      recentMessages,
      message.trim()
    );

    // Step 5: Call Gemini and get the stream
    const resultStream = await llmService.ask(systemPrompt, history, userMessage);

    // Set up Server-Sent Events (SSE) headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    let fullReply = '';

    // Step 6: Iterate through the stream and send chunks
    for await (const chunk of resultStream) {
      const chunkText = chunk.choices[0]?.delta?.content || '';
      if (chunkText) {
        fullReply += chunkText;
        // Send the chunk data to the client
        res.write(`data: ${JSON.stringify({ chunk: chunkText })}\n\n`);
      }
    }

    // Step 7: Persist both turns after the stream is fully complete
    await chatService.saveMessage(userId, 'user', message.trim(), sessionId);
    await chatService.saveMessage(userId, 'assistant', fullReply, sessionId);

    // End the stream
    res.write(`data: [DONE]\n\n`);
    res.end();

  } catch (err) {
    console.error('Chat error:', err);
    require('fs').appendFileSync('error.log', new Date().toISOString() + ' ' + err.stack + '\n');
    
    // If headers are already sent, we can't send a 500 status. We just close the stream.
    if (!res.headersSent) {
      res.status(500).json({ error: 'Something went wrong. Please try again.' });
    } else {
      res.write(`data: ${JSON.stringify({ error: 'Stream failed' })}\n\n`);
      res.end();
    }
  }
});

module.exports = router;
