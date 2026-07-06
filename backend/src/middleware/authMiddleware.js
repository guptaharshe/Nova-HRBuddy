const supabase = require('../config/supabaseClient');

/**
 * Verifies the Supabase access token using Supabase's own getUser method.
 * This is more reliable than manual JWT verification because it handles
 * secret encoding and token format automatically.
 *
 * Extracts user id and email, attaches to req.user.
 * Identity is NEVER trusted from the client body — only from this verified token.
 */
const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid authorization header' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      console.error('Auth verification failed:', error?.message);
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    req.user = {
      id: user.id,
      email: user.email,
    };

    next();
  } catch (err) {
    console.error('Auth middleware error:', err.message);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

module.exports = authMiddleware;
