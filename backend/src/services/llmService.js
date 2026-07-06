const Groq = require('groq-sdk');

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

/**
 * Helper function to delay execution for a given number of milliseconds.
 */
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Sends a message to Groq API with the assembled system prompt and chat history.
 * Includes automatic retry logic for 503 (Service Unavailable) errors.
 *
 * @param {string} systemPrompt - Full system instruction (handbook + employee + rules)
 * @param {Array} history - Recent turns in Groq { role, content } format
 * @param {string} userMessage - The current user message
 * @param {number} retries - Number of retry attempts remaining
 * @returns {AsyncIterable} The Groq stream object
 */
const ask = async (systemPrompt, history, userMessage, retries = 3) => {
  try {
    const stream = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        ...history,
        { role: 'user', content: userMessage }
      ],
      model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
      temperature: 0.5,
      max_tokens: 1024,
      stream: true,
    });
    return stream;
  } catch (err) {
    if (err.status === 503 && retries > 0) {
      console.warn(`Groq API 503 Error. Retrying... (${retries} attempts left)`);
      await sleep(2000); // Wait 2 seconds before retrying
      return ask(systemPrompt, history, userMessage, retries - 1);
    }
    throw err;
  }
};

module.exports = { ask };
