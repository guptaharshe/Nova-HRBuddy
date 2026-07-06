const supabase = require('../config/supabaseClient');

/**
 * Fetches the most recent messages for a user, ordered oldest-first.
 * Used to build chat history context for the LLM.
 *
 * @param {string} userId - Supabase auth user UUID
 * @param {number} limit - Max messages to fetch (default 10)
 * @returns {Array} Messages with { role, content, created_at }
 */
const getRecentMessages = async (userId, sessionId, limit = 10) => {
  let query = supabase
    .from('chat_messages')
    .select('id, session_id, role, content, created_at')
    .eq('user_id', userId);
    
  if (sessionId === 'all') {
    // Fetch all messages for sidebar, no session filter
  } else if (sessionId && sessionId !== 'legacy') {
    query = query.eq('session_id', sessionId);
  } else {
    query = query.is('session_id', null);
  }

  const { data, error } = await query
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching messages:', error.message);
    return [];
  }

  // Reverse so messages are oldest-first for the LLM history
  return (data || []).reverse();
};

/**
 * Persists a single message (user or assistant) to the chat_messages table.
 * Uses the service role client, so RLS is bypassed for trusted server writes.
 *
 * @param {string} userId - Supabase auth user UUID
 * @param {string} role - 'user' or 'assistant'
 * @param {string} content - Message text
 */
const saveMessage = async (userId, role, content, sessionId = null) => {
  const payload = { user_id: userId, role, content };
  if (sessionId && sessionId !== 'legacy') {
    payload.session_id = sessionId;
  }
  
  const { error } = await supabase
    .from('chat_messages')
    .insert(payload);

  if (error) {
    console.error('Error saving message:', error.message);
  }
};

/**
 * Deletes a specific user message and its immediately following assistant response.
 */
const deleteMessagePair = async (userId, messageId) => {
  // 1. Fetch the user message to get its created_at timestamp
  const { data: userMsg, error: fetchError } = await supabase
    .from('chat_messages')
    .select('created_at, role')
    .eq('id', messageId)
    .eq('user_id', userId)
    .single();

  if (fetchError || !userMsg || userMsg.role !== 'user') {
    throw new Error('Message not found or not a user message');
  }

  // 2. Find the immediate next assistant message
  const { data: assistantMsgs } = await supabase
    .from('chat_messages')
    .select('id')
    .eq('user_id', userId)
    .eq('role', 'assistant')
    .gt('created_at', userMsg.created_at)
    .order('created_at', { ascending: true })
    .limit(1);

  const assistantMsgId = assistantMsgs && assistantMsgs.length > 0 ? assistantMsgs[0].id : null;

  // 3. Delete them both
  const idsToDelete = [messageId];
  if (assistantMsgId) idsToDelete.push(assistantMsgId);

  const { error: deleteError } = await supabase
    .from('chat_messages')
    .delete()
    .in('id', idsToDelete)
    .eq('user_id', userId);

  if (deleteError) {
    throw new Error('Failed to delete messages');
  }
};

/**
 * Deletes all messages in a specific session.
 */
const deleteSession = async (userId, sessionId) => {
  const { error } = await supabase
    .from('chat_messages')
    .delete()
    .eq('user_id', userId)
    .eq('session_id', sessionId);

  if (error) {
    throw new Error('Failed to delete session');
  }
};

module.exports = { getRecentMessages, saveMessage, deleteMessagePair, deleteSession };
