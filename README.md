[![Netlify Status](https://api.netlify.com/api/v1/badges/d6abb5f1-e6c3-4d03-822d-9185aa83b711/deploy-status)](https://app.netlify.com/sites/avencrm/deploys)
---
# **Features by Dashboard**  

#### **3.1 Admin Dashboard**  
The Admin Dashboard provides a centralized view of system-wide statistics and company management.  

**3.1.1 Pages**  
1. **Dashboard Page**  
   - **Sales Statistics**: Line graph showing sales trends for Basic, Premium, and Enterprise plans.  
   - **Renewal Status**: Line chart showing renewal counts for all plans.  
   - **Plan Status**: Pie chart showing the percentage split of active plans.  
   - **Agents**: Bar graph displaying trends in agent count.  
   - **Revenue**: Line graph showing total sales revenue.  

2. **Companies Page**  
   - List of companies with details:  
     - Company Name, Plan, Contact Person, Agent Count, Plan Status.  
   - **Company Details View**:  
     - Contact Details: Name, Phone, Email.  
     - Subscription Info: Current Plan, Plan Status (Active/Inactive/Overdue).  
     - Logic for Status:  
       - **Overdue**: Current date > Next due date.  
       - **Inactive**: 7+ days after due date without renewal.  

3. **Payments Page**  
   - Payment history for all company subscriptions.  
   - Filters for date, amount, and company.  

4. **Settings Page**  
   - Update Admin profile details: username, email, mobile, address.  
   - Change password functionality.  

---

#### **3.2 Company Dashboard**  
The Company Dashboard enables companies to manage their agents, monitor performance, and oversee subscriptions.  

**3.2.1 Pages**  
1. **Manage Agents Page**  
   - List of agents with details: Name, DOB, Gender, Phone, Email, Role (Agent/Team Lead).  
   - **Actions**: Add, update, and delete agents.  

2. **Monitoring Page**  
   - **Total Agents**: Count of registered agents.  
   - **Revenue**: Display total and today’s revenue.  
   - **Pipeline**: Bar graph of deal status (e.g., New, Discovery, Proposal, Negotiation, Won).  
   - **Revenue Trends**: Line graph (Annual/Monthly).  

3. **Clients Page**  
   - **Leads**: List with name, phone, email, and status.  
   - **Deals**: List with name, status, deal value, email, expected close date, probability, and forecast value.  

4. **Subscription Page**  
   - Payment history.  
   - Upgrade plan functionality.  
   - Active plan details and expiration date.  

5. **Transaction Page**  
   - List of all financial transactions.  
   - Update transaction status (Paid/Due).  

---

#### **3.3 Agent Dashboard**  
The Agent Dashboard focuses on property management, client interactions, and deal tracking.  

**3.3.1 Pages**  
1. **Property Page**  
   - List of properties with key details: Address, Price, Bedrooms, Bathrooms, Area.  
   - **Actions**: Add, update, delete properties.  
   - **Property Details Page**:  
     - Images, Price, Address, Description.  
     - Property Type, Building Type, Square Footage.  
     - Community Name, Subdivision Name, Built Year, Annual Tax, Parking Type.  

2. **Marketing Page**  
   - Provide image templates for promotions.  

3. **Page Builder Page**  
   - Templates for property listing forms with customizable fields.  

4. **Leads Page**  
   - List of leads with details (name, status, phone, email).  
   - **Actions**: Add, update, delete leads.  

5. **Deals Page**  
   - List of deals with details (name, status, deal value, email, phone, probability).  
   - **Actions**: Add, update, delete deals.  

6. **Transaction Page**  
   - List of financial transactions.  
   - **Actions**: Add new transactions.  

7. **Monitoring Page**  
   - Metrics for assigned agents.  

---

#### **3.4 Team Lead Dashboard**  
The Team Lead Dashboard includes all Agent Dashboard features with additional functionality to manage and monitor assigned agents.  

**3.4.1 Pages**  
1. **Agents Page**  
   - List of agents under the Team Lead.  
   - **Actions**: Add, update, and delete agents.  

2. **Agent Monitoring Page**  
   - **Total Agents**: Count of assigned agents.  
   - **Revenue Trends**: Line graph for revenue metrics (Annual/Monthly).  
   - **Pipeline**: Bar graph showing deal statuses across assigned agents.  

---

### **4. Non-Functional Requirements**  

**4.1 Performance**  
- Subdomain generation must be completed within 5 seconds.  
- The platform should handle up to 100,000 concurrent users.  

**4.2 Security**  
- All passwords and sensitive data must be encrypted (e.g., bcrypt for passwords).  
- Implement role-based access controls to prevent unauthorized actions.  

**4.3 Scalability**  
- Support for over 10,000 companies with individual subdomains.  

**4.4 Availability**  
- Ensure 99.9% uptime with automated failover systems.  

---
### **Backend Development Checklist for AvenCRM**

---

#### **1. Authentication and Authorization**
- [ ] User Role Management: Admin, Company, Agent, Team Lead.
- [ ] OTP-based first-time login for Company, Agent, and Team Lead.
- [ ] JWT-based authentication for session handling.
- [ ] Password hashing (e.g., bcrypt).
- [ ] Role-based Access Control (RBAC) to restrict API access.
- [ ] Email integration for OTP and notifications.

---

#### **2. Subdomain Management**
- [ ] API to dynamically generate subdomains (e.g., `xyz.avencrm.com`).
- [ ] Route requests to the correct company database based on the subdomain.
- [ ] Middleware to verify and resolve subdomain data.

---

#### **3. Admin Dashboard Backend**
- **Statistics APIs**:
  - [ ] Sales statistics (line graph) by plan and time frame.
  - [ ] Renewal status (line chart) by plan.
  - [ ] Plan status (pie chart) percentage.
  - [ ] Agents (bar graph) count over time.
  - [ ] Revenue trends (line graph).
- **Company Management**:
  - [ ] List all companies with details.
  - [ ] API to retrieve specific company details.
  - [ ] Status logic for plans (Active/Inactive/Overdue).
- **Payment Management**:
  - [ ] API for payment history retrieval.
  - [ ] Integration with payment gateway.
- **Settings**:
  - [ ] APIs to update profile details (username, email, phone, etc.).
  - [ ] Password update API.

---

#### **4. Company Dashboard Backend**
- **Agent Management**:
  - [ ] API to list agents with details.
  - [ ] Add, update, and delete agent functionality.
- **Monitoring**:
  - [ ] Total agents API.
  - [ ] Revenue API (daily and total).
  - [ ] Pipeline data API (deal status breakdown).
  - [ ] Revenue trends API (annual/monthly).
- **Client Management**:
  - [ ] Leads API: Add, update, delete, and retrieve leads.
  - [ ] Deals API: Add, update, delete, and retrieve deals.
  - [ ] Calculate deal close probability and forecast value.
- **Subscription Management**:
  - [ ] Active plan details API.
  - [ ] Upgrade plan functionality.
  - [ ] Payment history retrieval API.
- **Transaction Management**:
  - [ ] API to list all transactions.
  - [ ] Update transaction status (Paid/Due).

---

#### **5. Agent Dashboard Backend**
- **Property Management**:
  - [ ] CRUD APIs for properties.
  - [ ] API to retrieve property details.
- **Marketing**:
  - [ ] API to serve marketing templates.
- **Page Builder**:
  - [ ] Template management API for property listings.
- **Leads and Deals**:
  - [ ] CRUD APIs for leads and deals.
  - [ ] Calculate and retrieve deal probabilities and forecast values.
- **Transaction Management**:
  - [ ] Add and retrieve transaction details.
- **Monitoring**:
  - [ ] Metrics and data retrieval APIs for agent-specific stats.

---

#### **6. Team Lead Dashboard Backend**
- **Agent Management**:
  - [ ] APIs to list, add, update, and delete agents under the Team Lead.
  - [ ] Assign or reassign agents to Team Leads.
- **Agent Monitoring**:
  - [ ] APIs for total agents and revenue stats (by Team Lead).
  - [ ] Pipeline data APIs (deal breakdown for agents under the Team Lead).

---

#### **7. Notification System**
- [ ] Email integration for:
  - OTP during onboarding.
  - Payment confirmations.
  - Plan renewal reminders.
- [ ] Push notification APIs for updates and reminders.

---

#### **8. Reporting and Analytics**
- [ ] API for generating charts and graphs:
  - Line graphs for sales and revenue.
  - Bar graphs for pipeline and agents.
  - Pie charts for plan distribution.
- [ ] Export reports as CSV or PDF.

---

#### **9. Payment Gateway Integration**
- [ ] APIs for subscription payments.
- [ ] Webhook for payment success/failure notifications.
- [ ] Secure tokenization of payment data.

---

#### **10. Logging and Monitoring**
- [ ] API request/response logging.
- [ ] Error and crash frequency monitoring.
- [ ] Audit logs for all user activities.

---

#### **11. Database Design**
- [ ] User Table:
  - Fields for role, email, phone, hashed password, etc.
- [ ] Company Table:
  - Fields for subdomain, plan details, subscription status, etc.
- [ ] Agent Table:
  - Fields for team lead association, contact details, etc.
- [ ] Property Table:
  - Fields for address, price, features, and description.
- [ ] Leads Table:
  - Fields for name, contact details, and lead status.
- [ ] Deals Table:
  - Fields for deal value, probability, forecast value, etc.
- [ ] Transactions Table:
  - Fields for payment status, amount, and related IDs.

---

#### **12. Scalability and Performance**
- [ ] Implement caching for frequently accessed data (e.g., Redis).
- [ ] Database indexing for faster queries.
- [ ] Load balancing for high traffic.
