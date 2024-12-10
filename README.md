Project Description

The Alphacons Conference Registration System simplifies the registration process for conferences, allowing attendees to register as authors or regular attendees. Authors present their papers, while regular attendees participate to listen and learn.

Features


User Features
- Account Creation: Attendees can create accounts with roles as Author or Regular Attendee.
- Profile Management: Includes full name, email address, dietary restrictions, and pronouns.
- Fee Calculation:Authors and regular attendees pay different fees, with optional additional events adding extra costs.
- Event Selection:Users can choose optional events beyond the main conference.
- - Mobile-friendly responsive desig

Admin Features
- Content Management: Admins can easily update conference content, fees, and optional event details through an intuitive UI.
- Non-Technical Admin Access: Designed for non-technical admins, eliminating the need for direct database access.


Technologies Used

 Frontend
- Framework: React 
- Styling: CSS

 Backend
- Framework: Node.js with Express
- Database: Mysql hosted on Google Cloud
- Details about backend API and database schema are included in the backend/README.md file.

---

 Others
- Payment Integration:Stripe




Setup Instructions

Prerequisites
- Node.js and npm installed
- Database  set up
- Payment gateway credentials (Stripe/PayPal)

 Steps
1. Clone the repository:
   ```bash
   git clone https://github.com/your-repo-url/conference-registration-system.git
   ```
2. Navigate to the **frontend** folder and install dependencies:
   ```bash
   cd frontend
   npm install
   ```
3. Start the frontend:
   ```bash
   npm start
   ```
4. Navigate to the **backend** folder, install dependencies, and set up the database:
   ```bash
   cd backend
   npm install
   ```
5. Start the backend:
   ```bash
   npm run start
   ```
6. Open the app in your browser at `http://localhost:3000`.





