# Placement Management System (PMS)

A comprehensive web-based Placement Management System designed for S.A. Engineering College. It streamlines and automates the placement processes, connecting students, placement officers, department heads, and recruiting companies.

## 🌟 Features

- **Role-Based Access Control:** Separate portals and secure dashboards for an assortment of roles, including Admins, Placement Directors, Placement Staff, Department HODs, Students, and Other Staff.
- **Student Profiling:** Students can actively manage their academic profiles, upload resumes, and seamlessly track their job applications.
- **Job Management:** Placement staff and directors can create, evaluate, and monitor job postings and recruitment drives.
- **Analytics & Dashboards:** Access detailed real-time analytics for placement statistics, department-wise progress, and student application conversion rates.
- **Document Handling:** Safely handle student resumes, academic records, and profile pictures.
- **Job Applications Routing:** Simplifies the process of job applications, maintaining clear status tracking for "Applied", "Shortlisted", "Interview", and "Hired" states, and exports data flexibly.

## 🛠 Technology Stack

### Frontend
- **Framework:** React.js (v18)
- **UI Library:** Material-UI (MUI v5)
- **Routing:** React Router DOM (v6)
- **Charting & Visualizations:** Chart.js & react-chartjs-2
- **Data Exporting/Parsing:** Papa Parse and SheetJS (xlsx) for handling CSV/Spreadsheets
- **PDF Generation:** jsPDF & html2canvas

### Backend
- **Framework:** Node.js with Express.js
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JSON Web Tokens (JWT) & bcryptjs 
- **File Uploads:** Multer for managing multipart/form-data
- **Email Communications:** Nodemailer integration

## 📂 Project Structure

- `frontend/`: Contains the React graphical interface, based on the `material-dashboard-2-react` template architecture.
- `backend/`: Node.js and Express API server holding the system's core logistics, database models, controllers, and routing mechanisms.

## 🚀 How to Run Locally

### Prerequisites
- Node.js (v18.x or later installed)
- Running MongoDB instance (Local or Atlas)
- NPM (Node Package Manager)

### 1. Backend Setup

1. Open your terminal and navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install all required dependencies for the backend environment:
   ```bash
   npm install
   ```
3. Establish your environment variables:
   Create a `.env` file in the `backend/` directory with the needed keys, like your MongoDB URI, Port, JWT secrets, etc.
   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   ```
4. (Optional) Run Initial Seeder to start with some data:
   ```bash
   npm run fresh:start
   ```
5. Spin up the backend server:
   ```bash
   npm start      # For standard node execution
   npm run dev    # For Nodemon watch execution
   ```
   The application's backend server will now be accessible from `http://localhost:5000`.

### 2. Frontend Setup

1. Open up an entirely new terminal window and migrate into the frontend directory:
   ```bash
   cd frontend
   ```
2. Install frontend dependencies:
   ```bash
   npm install --legacy-peer-deps
   # or simple `npm install`
   ```
3. Set your internal application configurations:
   Create a `.env` file directly under the `frontend/` directory pointing toward your backend.
   ```env
   REACT_APP_API_URL=http://localhost:5000/api
   ```
4. Build and start the development server:
   ```bash
   npm start
   ```
   The frontend UI will automatically open in your default browser at `http://localhost:3000`.

## ⚙️ How It Works

1. **Authentication Process:** Users log in securely through the primary authentication portal. Upon a user's first login, the PMS enforces a mandated temporary password change.
2. **Dynamic Dashboards Navigations:** The logged-in user retrieves a contextualized view. Students are shown their active eligible jobs, the department HODs access their student analytics, and the placement director governs overarching institutional insights.
3. **The Job Workflow:** 
   - A placement user dynamically creates **Job Posts** stipulating constraints (e.g., Target Departments, Required CGPA criteria, Active Backlog bounds). 
   - Only eligible **Students** see these matching openings on their dashboards, mitigating unqualified application spam.
   - Students optionally hit "Apply", pushing their profiles and resumes securely.
   - Placements staff use the **Job Monitoring** hub where they orchestrate batch processing for students scaling through different application tiers up until their hiring phase.
4. **Export Automation:** Complex reports such as the 'Department Batches' views log dynamic insights exported elegantly through CSV/Excel integrations leveraging `xlsx` libraries.

---

**Placement Management System (PMS)**
Created for efficient coordination between institutions, students, and partnering companies.