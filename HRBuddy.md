# **Project Brief: HRBuddy — Personalized HR Policy Chatbot**

**Assigned by:** Kratya AI Engineering Team   
**Time Limit:** 1 Day   
**Goal:** Build a chatbot that answers company HR policy questions AND personalized employee queries (leave balance, salary, etc.) based on who is logged in.

---

## **1\. Background**

You're building an internal chatbot for a dummy company, **NovaTech Pvt Ltd**. Employees should be able to log in and ask the bot questions about:

* General company policy (leave rules, WFH policy, reimbursement, notice period, etc.)  
* Their own personal HR data (leave balance, salary breakdown, joining date, etc.)

The bot must **never** reveal one employee's personal data to another employee, and must **never make up information** that isn't in the handbook or the employee's profile.

## **2\. What You're Given**

### **A. Company Handbook (static, same for everyone)**

A short HR policy document covering:

* Leave policy (types, accrual rules, carry-forward)  
* WFH/hybrid policy  
* Expense reimbursement process  
* Notice period & probation policy  
* Public holiday list

*(See attached: `novatech_handbook.docx`)*

### **B. Employee Login Credentials & Profiles**

Three dummy employee accounts, each with login credentials and a personal profile (post, joining date, CTC breakdown, leave balance).

*(See attached: `employee_profiles.docx`)*

## **3\. What You Need to Build**

### **Core Features**

1. **Login system** — email \+ password (no need for OAuth/Google login; simple credential check against the 3 provided accounts is enough).  
2. **Chat interface** — UI where a logged-in employee can ask questions.  
3. **Backend logic** that:  
   * Answers general policy questions using the company handbook.  
   * Answers personal questions (leave balance, salary, joining date) using **only the logged-in user's own profile**.  
   * Refuses to answer if asked about another employee's data.  
   * Refuses to answer things not covered by the handbook or profile (no hallucination).  
   * Does not "approve" or "authorize" anything (e.g., leave requests) — it can explain the process but must redirect actual approval to HR/manager.  
4. **Deployment** — the app must be live (Vercel/Netlify/Render/Railway or similar), not just running on localhost.

**4\. Design Decisions You Need to Make**  
You'll need to decide and document:

1. **How does the bot know who's asking?**  
2. **How do you stop data leakage between employees?**   
3. **What counts as "out of scope"?**   
4. **How do you prevent the bot from hallucinating?**

Write a **DESIGN.md** explaining these decisions — this matters as much as the code.

## **6\. Deliverables**

By end of day, please share:

1. **Live deployed link**  
2. **GitHub repo link** (with a short README on setup/tech choices)  
3. **DESIGN.md** — your decisions on identity handling, data isolation, and refusal logic  
4. (Optional bonus) A short list of any adversarial prompts you tried yourself and how the bot handled them

