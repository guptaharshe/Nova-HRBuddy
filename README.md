# NovaTech - HRBuddy

HRBuddy is a personalized, AI-powered internal HR chatbot built for **NovaTech Pvt Ltd**. It acts as a 24/7 intelligent HR assistant capable of answering general company policies while seamlessly weaving in personalized, employee-specific data based on who is securely logged in.

This project was built to fulfill the requirements detailed in the provided documentation:
- `HRBuddy.md` (Project Brief)
- `NovaTech Pvt Ltd - Employee Handbook.md` (General Company Policies)
- `NovaTech Pvt Ltd - Employee Login Credentials & Profiles.md` (Personalized Employee Data)

## Key Features
- **Intelligent RAG:** Accurately answers questions using the company handbook without hallucinating.
- **Personalized Context:** Seamlessly pulls from the user's specific CTC (salary breakdown) and leave balances when asked.
- **Strict Data Isolation:** Built with backend-enforced identity boundaries (JWT validation and Row-Level Security) to ensure no employee can access another employee's private compensation or leave data.
- **Guardrails:** Explicitly refuses to authorize or approve leaves/expenses, redirecting users to human managers/HR instead.
- **Modern Chat Sessions:** Groups messages by conversation sessions, just like modern AI chat apps. 

## Testing Credentials
You can log in to test the application using any of the three pre-seeded accounts:

1. **Aditi Sharma** (Software Development Engineer)
   - **Email:** `aditi.sde@novatech.com`
   - **Password:** `pass123`

2. **Rohan Mehta** (Sales Executive)
   - **Email:** `rohan.sales@novatech.com`
   - **Password:** `pass123`

3. **Priya Verma** (Engineering Manager)
   - **Email:** `priya.manager@novatech.com`
   - **Password:** `pass123`

*Try asking about your leave balances while logged in as different users to see the personalized isolation working!*

## Tech Stack
- **Frontend:** React, TailwindCSS
- **Backend:** Node.js, Express.js
- **Database / Auth:** Supabase
- **LLM Engine:** Groq (Llama-3.3-70b-versatile)

## Getting Started

### Backend
1. `cd backend`
2. `npm install`
3. Ensure `.env` is correctly populated with `GROQ_API_KEY`, `SUPABASE_URL`, and `SUPABASE_SERVICE_ROLE_KEY`.
4. `npm run dev`

### Frontend
1. `cd frontend`
2. `npm install`
3. Ensure `.env` is correctly populated with `REACT_APP_SUPABASE_URL`, `REACT_APP_SUPABASE_ANON_KEY`, and `REACT_APP_BACKEND_URL`.
4. `npm start`
