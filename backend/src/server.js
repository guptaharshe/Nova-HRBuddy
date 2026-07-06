// Load environment variables before anything else
require('dotenv').config();

const app = require('./app');

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`HRBuddy backend running on port ${PORT}`);
});
