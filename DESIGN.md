# HRBuddy Design Decisions

As required by the HRBuddy project brief, this document explains the core architectural and security decisions made during the development of this application.

### 1. How does the bot know who's asking?
Identity is strictly established through the backend via **Supabase JWT validation**, never via client-side assertions. 
When a user logs in on the frontend, Supabase issues an authentication token. Every time the frontend sends a chat message, this token is passed in the `Authorization` header. The Express backend's auth middleware (`authMiddleware.js`) intercepts the request and cryptographically verifies the token using Supabase. Once verified, the backend extracts the verified `email` address directly from the token and uses it to look up the exact employee profile from our data layer. The bot never trusts a "user ID" sent in the JSON body.

### 2. How do you stop data leakage between employees?
Data leakage is prevented through a two-layered defense system:
1. **Server-Side Data Injection:** The LLM does not have access to the entire `employees.json` database. The `promptBuilder` service acts as a strict firewall. It only ever passes a *single* `CURRENT_EMPLOYEE` JSON object to the LLM (the one matching the verified JWT email). The LLM physically cannot leak another employee's salary because it never receives it in its context window.
2. **Database Row-Level Security (RLS):** Supabase's RLS policies are enabled on the `chat_messages` table. Even if the backend were compromised, the database itself enforces a rule where a user can only `SELECT` or `INSERT` chat messages where the `user_id` matches their own authentication `uid()`. It is mathematically impossible for Rohan to fetch Aditi's chat history.

### 3. What counts as "out of scope"?
"Out of scope" is defined as any question or request that cannot be answered using either:
- The static company handbook (`handbook.json`)
- The specific logged-in user's profile data (`CURRENT_EMPLOYEE`)

Furthermore, the system prompt explicitly defines operational guardrails: the bot is forbidden from acting as an authority. If an employee asks the bot to "approve my leave" or "authorize this expense", this is considered out of scope for an assistant. The bot is instructed to only explain the process (e.g., "submit your request via the portal") and redirect them to their manager.

### 4. How do you prevent the bot from hallucinating?
Hallucinations are mitigated through aggressive system prompting and LLM context restriction. 
The system prompt begins with a strict directive: *"Only answer using the HANDBOOK and CURRENT_EMPLOYEE data below."* 
Additionally, we added a fallback guardrail: *"If the answer isn't in the HANDBOOK or CURRENT_EMPLOYEE data, politely say you don't have that information and suggest contacting HR. NEVER mention the words 'handbook', 'provided data', or 'system prompt' to the user."* 
Because we use a powerful, highly instruction-tuned model (Llama-3.3-70b-versatile via Groq), it excels at following these strict RAG (Retrieval-Augmented Generation) constraints, completely eliminating the tendency to invent generic HR policies.
