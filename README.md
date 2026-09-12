# Resume-Master-Frontend-ML-Project

The modern single-page frontend application for the **Resume Master AI Screening & Candidate Matching System**, built with React 18, Vite, Tailwind CSS, and Lucide Icons.

---

## 🌟 Features

- **Authentication & Role-Based Access Control:**
  - Secure JWT authentication with persistent session state.
  - Recruiter and Candidate roles with dedicated views and permissions.
- **Job Management:**
  - Browse open job listings with required skills, experience levels, and degrees.
  - Recruiter interface to publish new job openings with interactive skill tagging.
- **AI Resume Parsing & Preview:**
  - Upload CVs in PDF or DOCX format.
  - Instant parsing preview displaying extracted candidate details, identified skills, years of experience, and highest education degree.
- **Machine Learning Candidate Leaderboard:**
  - Run matching against candidate pools using the trained **Random Forest Classifier** (`model.pkl`).
  - Candidate ranking with score progress bars (0–100%).
  - Detailed skill gap breakdown with **Matched Skills (Green pills)** and **Missing Skills (Red pills)**.
  - Transparent ML explainability breakdown (TF-IDF Similarity, Skill Overlap %, Experience Delta, Education Level score).

---

## 🛠️ Technology Stack

- **Framework:** [React 18](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Routing:** [React Router v6](https://reactrouter.com/)
- **HTTP Client:** [Axios](https://axios-http.com/)
- **Backend API:** FastAPI + Python ML Pipeline (`http://localhost:8000`)

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v18+ or v20+)
- npm (v9+)
- Running FastAPI backend on `http://localhost:8000`

### 2. Installation
```bash
# Navigate to frontend directory
cd frontend

# Install project dependencies
npm install
```

### 3. Development Server
```bash
npm run dev
```
The application will be running locally at `http://localhost:5173`.

### 4. Production Build
```bash
npm run build
```
Generates optimized static assets into the `dist/` directory.

---

## 📂 Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── Navbar.jsx            # Top navigation bar & user status
│   │   └── ProtectedRoute.jsx    # Authentication & role guard
│   ├── context/
│   │   └── AuthContext.jsx       # Auth state management & token handling
│   ├── pages/
│   │   ├── Login.jsx             # Recruiter & candidate sign in
│   │   ├── Register.jsx          # User registration with role selection
│   │   ├── Dashboard.jsx         # Overview dashboard & system statistics
│   │   ├── JobsList.jsx          # Job board with filters & search
│   │   ├── CreateJob.jsx         # Post new job with interactive tags
│   │   ├── ResumeUpload.jsx      # Resume file uploader with live extraction
│   │   └── MatchingDashboard.jsx # ML ranking leaderboard & skill explainability
│   ├── services/
│   │   └── api.js                # Configured Axios client with bearer tokens
│   ├── App.jsx                   # Route provider & layout
│   ├── index.css                 # Tailwind CSS styles
│   └── main.jsx                  # Application root mount
├── index.html                    # HTML document template
├── package.json                  # Dependencies & scripts
├── tailwind.config.js            # Tailwind styling configurations
└── vite.config.js                # Vite build & proxy settings
```
