# FieldSignal — Athletic Social & AI Performance Analysis Platform

A full-stack, end-to-end Athletic Social & Performance Analysis Platform. **FieldSignal** combines a high-contrast React frontend, a Node.js/Express backend with MongoDB and Cloudinary video management, and a Python FastAPI Machine Learning engine powering Cricket Batting Stroke Classification, Biomechanical Pose Analysis, and PDF report generation.

---

## 🏗️ System Architecture

The project consists of three decoupled, interoperable layers:

```
                  ┌─────────────────────────────────────────┐
                  │          React 18 + Vite UI            │
                  │   (Athlete, Coach, Admin Dashboards)    │
                  └───────────────────┬─────────────────────┘
                                      │
                      ┌───────────────┴───────────────┐
                      ▼                               ▼
     ┌─────────────────────────────────┐   ┌──────────────────────────────────┐
     │      Node.js / Express API      │   │    Python FastAPI ML Engine      │
     │  - MongoDB (Auth & Users)       │   │  - MediaPipe (33 Landmarks)      │
     │  - Cloudinary (Video Uploads)   │   │  - PyTorch BiLSTM (Stroke Classifier)│
     │  - Role-Based Access Control    │   │  - Biomechanical Scoring & PDF   │
     └─────────────────────────────────┘   └──────────────────────────────────┘
```

1. **Frontend (`src/`)**: React 18 + Vite application featuring a dark, high-contrast athletic design system (`src/styles/tokens.css`), interactive Recharts visualization, and Role-Based Access Control (Athlete, Coach, Admin).
2. **Backend Service (`backend/`)**: Node.js & Express API providing authentication (JWT & bcrypt), MongoDB data persistence, Cloudinary video uploading, user management, and administration endpoints.
3. **ML Inference Engine (`ml/`)**: Standalone Python FastAPI microservice utilizing MediaPipe for 33 3D landmark extraction, 528-dimensional frame feature engineering, PyTorch BiLSTM neural network stroke prediction, biomechanical technique scoring (0-100), and PDF analysis report creation.

---

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite, Recharts, Lucide Icons, Vanilla CSS (Token-based design system)
- **Backend API**: Node.js, Express, Mongoose (MongoDB), Cloudinary SDK, JWT, bcryptjs
- **ML / AI Engine**: Python 3.9+, FastAPI, PyTorch, MediaPipe, OpenCV, NumPy, Pandas, Scikit-learn, ReportLab

---

## 📋 Prerequisites

Ensure you have the following installed on your environment:

- **Node.js**: v18.0.0 or higher ([Download Node.js](https://nodejs.org/))
- **Python**: v3.9 or higher ([Download Python](https://www.python.org/))
- **MongoDB**: A running local MongoDB instance (`mongodb://localhost:27017`) or a [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster URI.
- **Git**: For source control.

---

## ⚙️ Environment Configuration

Create a `.env` file in the project root directory (`Athletic-Platform/.env`) with the following environment variables:

```env
# Node.js Server Port
PORT=5000

# MongoDB Database Connection String
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/athletic-db

# JWT Secret Key for Authentication
JWT_SECRET=your_super_secret_jwt_key_here

# Cloudinary Storage Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Microservices Communication
ML_SERVICE_URL=http://127.0.0.1:8000
VITE_API_URL=http://localhost:5000/api
VITE_ML_SERVICE_URL=http://localhost:8000

# Admin Seed Credentials
ADMIN_EMAIL=admin@gmail.com
ADMIN_PASSWORD=admin123
```

---

## 🚀 How to Run the Project

To run the complete platform, you need to start **three services**: the ML FastAPI Server, the Node.js Express Backend, and the React Vite Frontend.

### Step 1: Start the Python ML Inference Engine

1. Navigate to the ML directory:
   ```bash
   cd ml
   ```

2. (Optional but recommended) Create and activate a virtual environment:
   ```bash
   # Windows
   python -m venv venv
   .\venv\Scripts\activate

   # macOS/Linux
   python3 -m venv venv
   source venv/bin/activate
   ```

3. Install required Python packages:
   ```bash
   pip install -r requirements.txt
   ```

4. Launch the FastAPI server:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```
   *The ML service will start at `http://localhost:8000` (Health Check: `http://localhost:8000/api/ml/health`).*

---

### Step 2: Start the Node.js Express Backend

Open a **new terminal tab/window**:

1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```

2. Install Node dependencies:
   ```bash
   npm install
   ```

3. Seed the default Admin user (First time only):
   ```bash
   npm run seed:admin
   ```

4. Start the Express server:
   ```bash
   npm start
   ```
   *The Express API server will start on port 5000 (`http://localhost:5000`).*

---

### Step 3: Start the React Frontend Application

Open another **new terminal tab/window** in the project root (`Athletic-Platform`):

1. Install frontend dependencies:
   ```bash
   npm install
   ```

2. Launch the Vite development server:
   ```bash
   npm run dev
   ```

3. Open your browser and navigate to:
   ```
   http://localhost:5173
   ```

---

## 📂 Directory Structure

```
Athletic-Platform/
├── backend/                  # Node.js & Express Backend API
│   ├── config/               # DB, Cloudinary & Admin Seed configurations
│   ├── controllers/          # Request handlers (Auth, Upload, Analysis, Admin)
│   ├── middleware/           # JWT Authentication & RBAC middleware
│   ├── models/               # Mongoose Data Models (User, AnalysisResult)
│   ├── routes/               # Express API endpoints
│   ├── scripts/              # Standalone admin seed scripts
│   └── server.js             # Express entry point
│
├── ml/                       # Python ML & Computer Vision Engine
│   ├── analysis/             # Biomechanical pose analysis & technique scoring
│   ├── api/                  # High-level Python analysis API (`analyze_video`)
│   ├── app/                  # FastAPI main application (`main.py`)
│   ├── assets/               # Normalization matrices (mean, std)
│   ├── config/               # Feature & model configurations (`config.yaml`)
│   ├── features/             # 528-dim landmark feature extraction
│   ├── inference/            # PyTorch BiLSTM stroke predictor engine
│   ├── models/               # Neural network models & pre-trained weights (`best_model.pth`)
│   ├── pose/                 # MediaPipe 33-landmark extractor
│   ├── preprocessing/        # Video decoding & normalization tools
│   ├── reports/              # PDF report generator (ReportLab)
│   └── requirements.txt      # Python dependencies
│
├── src/                      # React Frontend Application
│   ├── api/                  # Frontend API client modules (authApi, analysisApi, mockApi)
│   ├── components/           # Reusable UI primitives, charts, & dashboard views
│   │   ├── admin/            # Admin moderation & broadcasting panels
│   │   ├── athlete/          # Athlete dashboard, video upload, AI feedback
│   │   ├── coach/            # Coach athlete roster & opportunity composer
│   │   └── ui/               # Shared design components (Buttons, Cards, Badges, Tabs)
│   ├── context/              # Role & Auth state providers
│   ├── hooks/                # Data fetching custom hooks (`useAsyncData`)
│   ├── styles/               # CSS Design tokens (`tokens.css`) & global styling
│   ├── App.jsx               # Main React entry component
│   └── main.jsx              # React DOM render entry
│
├── .env                      # Environment variables configuration
├── index.html                # Vite HTML entry point
├── package.json              # Root npm dependencies & scripts
└── vite.config.js            # Vite bundler configuration
```

---

## ⚡ Quick Testing & Verification

- **ML Inference Test**:
  Run standalone video inference testing from the root directory:
  ```bash
  python ml/test_ml.py <path_to_video.mp4>
  ```

- **Backend RBAC Test**:
  Test Role-Based Access Control endpoints:
  ```bash
  node backend/test-rbac.js
  ```

---

## 🔐 Default Admin Credentials

If you ran `npm run seed:admin` in the backend directory:
- **Email**: `admin@gmail.com`
- **Password**: `admin123`
- **Role**: `admin`

