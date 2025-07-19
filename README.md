🗳️ Feedbackly
A modern full-stack feedback form platform that allows admins to create custom feedback forms and collect responses efficiently with Access to form via a public URL .

🚀 Tech Stack
Frontend: React.js (with Vite), Shadcn Ui, Tailwind css

Backend: Node.js, Express.js

Database: MongoDB with Mongoose

Authentication: JWT

Deployment-ready structure

📁 Project Structure

feedbackly/
│
├── client/                 # Frontend (React + Vite)
├── server/                 # Backend (Express + MongoDB)
│   ├── models/             # Mongoose models (Admin, FeedbackForm, FeedbackResponse)
│   ├── routes/             # API endpoints
│   ├── controllers/        # Business logic
│   ├── middleware/         # Auth and validation
│   └── index.js            # Entry point
└── README.md

| Route                 | Component        | Access      | Description                                         |
| --------------------- | ---------------- | ----------- | --------------------------------------------------- |
| `/`                   | `Home`           | Public      | Landing page for all users.                         |
| `/auth`               | `Auth`           | Public      | Authentication page for admin (login/register).     |
| `/form/:formId`       | `FormForUser`    | Public      | End-user view to submit feedback using form link.   |
| `/admin`              | `ProtectedRoute` | Private | Base route for admin section. Uses nested routing.  |
| `/admin/dashboard`    | `AdminDashboard` | Private | Displays all feedback forms created by the admin.   |
| `/admin/form/:formId` | `AdminEachForm`  | Private| Admin view for individual form responses and stats. |


🛠️ How to Run Locally

1. Clone the Repository

git clone https://github.com/cdileep23/feedbackly.git
cd feedbackly


2. Setup the Server (Backend)

cd server
npm install
✅ Create a .env file with the following:

PORT=5000
MONGODB_URI=your_mongo_connection_string
JWT_SECRET=your_secret_key

//I have shared my env values in the form


Then run the server:


npm run dev
Server runs on http://localhost:5000

3. Setup the Client (Frontend)

cd ../client
npm install
npm run dev

Client runs on http://localhost:5173

🧠 Key Features
👤 Admin authentication (login/register)

📄 Create & manage feedback forms (with text, MCQ, Yes/No)

📬 Collect and view responses with publci access

⏳ Set expiry and active status for forms

📊 Responsive and clean UI

🧱 Schema Design
👤 Admin Model

{
  name: String,
  email: { unique: true },
  password: String
}


📋 Feedback Form Model


{
  adminId: ObjectId,
  title: String,
  description: String,
  questions: [{
    questionText: String,
    questionType: "text" | "mcq" | "yesno",
    options: [String], 
    isRequired: Boolean
  }],
  isActive: Boolean,
  expiresAt: Date,
  createdAt: Date,
  updatedAt: Date
}

🗣️ Feedback Response Model

{
  feedbackFormId: ObjectId,
  responses: [{
    questionText: String,
    answer: String
  }],
  submittedBy: String,
  submittedAt: Date
}

🧠 Design Decisions & Approach
Schema validation: Ensures MCQs have 2–10 options ,each form can have upto 10 fields and other types don’t accept options.

Clean separation: Controllers, routes, and models are modular and maintainable.

Indexing: On adminId, createdAt, and isActive to optimize dashboard & expiry logic.

Security: JWT-based auth, password hashing, and input sanitization.

Frontend performance: Vite for fast builds, React hooks for state and form management.
