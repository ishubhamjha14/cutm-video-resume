# CUTM VIDEO RESUME

> **An Interactive Digital Resume & Project Presentation**  
> **Institution:** Centurion University of Technology and Management (CUTM)  
> **Team:** Team 03 (*Shubham Kumar Jha, Priyatam Raj, Jisu Kumar Thakur*)

---

## 🌟 Overview

**CUTM Video Resume** is a modern full-screen, page-based vertical scrolling web application designed as an interactive digital portfolio and engineering presentation. Built with cinematic dark aesthetics, smooth scroll-snap interactions, dynamic QR codes, and a secure admin management portal.

### ✨ Key Features

1. **Vertical Full-Screen Presentation (4 Pages)**:
   - **Page 1 — Hero / Title**: CUTM Emblem logo, cinematic typography, Team 03 badge, and smooth entrance animations.
   - **Page 2 — Team Resumes**: 3 interactive CV cards (*Shubham Kumar Jha*, *Priyatam Raj*, *Jisu Kumar Thakur*) with modal PDF/Document viewer, zoom controls, and direct download.
   - **Page 3 — Raw & Uncut Videos**: 3 behind-the-scenes recording slots with video playback and dynamic QR code for instant mobile viewing.
   - **Page 4 — Final Video Resume**: Cinematic video player with custom controls, dynamic mobile QR code, and university project footer.
2. **Navigation & Gestures**:
   - Smooth CSS scroll-snap (`100vh` per section).
   - Mouse wheel, touch swipe (mobile & tablet), keyboard arrows (`Up`, `Down`, `PageUp`, `PageDown`, `Home`, `End`).
   - Floating vertical right-side pagination indicator (`01` - `04`) with tooltips.
3. **Secure Admin Portal**:
   - Discreet `ADMIN` button in the top navbar.
   - Protected with JWT backend authentication (no client-side hardcoded credentials).
   - Overview metrics dashboard showing upload progress.
   - Dedicated upload, replace, preview, and delete managers for CVs, Raw Videos, and Final Video.
   - Dynamic QR Code Manager with one-click **PNG Download** and **Copy Public Link**.
4. **Dual-Mode Persistence & Storage**:
   - Seamless MongoDB database support via Mongoose.
   - Automatic persistent local storage engine fallback when MongoDB is offline.
   - Pluggable storage abstraction for local uploads and cloud storage (Cloudinary / Supabase).

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend Framework** | React 18 + Vite (TypeScript) |
| **Styling & Design** | Tailwind CSS + Glassmorphism + Custom Scroll-Snap |
| **Animations & Icons** | Framer Motion + Lucide React |
| **QR Code Engine** | `qrcode.react` (SVG / High-Res PNG Export) |
| **Backend API** | Node.js + Express.js (ES Modules) |
| **Database** | MongoDB (Mongoose) + Atomic JSON persistence engine fallback |
| **File Processing** | Multer (MIME-type & file size validation) |
| **Security** | JWT Authentication, Bcrypt, CORS, Helmet |

---

## 📁 Directory Structure

```text
d:\Shubham\jr projject\
├── backend/
│   ├── data/
│   │   └── db.json                  # Local persistence fallback database
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js                # MongoDB connection & fallback handler
│   │   │   └── env.js               # Environment variables validation
│   │   ├── controllers/
│   │   │   ├── authController.js    # Admin login, verify & logout
│   │   │   ├── cvController.js      # CV list, upload, delete
│   │   │   ├── videoController.js   # Raw & Final video handlers
│   │   │   ├── qrController.js      # Dynamic QR resolution
│   │   │   └── statsController.js   # Admin dashboard statistics
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js    # JWT verification
│   │   │   └── uploadMiddleware.js  # Multer filters for PDF/DOC & MP4/WebM
│   │   ├── models/
│   │   │   ├── CV.js
│   │   │   ├── RawVideo.js
│   │   │   └── FinalVideo.js
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── cvRoutes.js
│   │   │   ├── videoRoutes.js
│   │   │   ├── qrRoutes.js
│   │   │   └── statsRoutes.js
│   │   ├── services/
│   │   │   ├── dbService.js         # Unified dual-mode DB service
│   │   │   └── storageService.js    # Upload path & disk management
│   │   └── server.js                # Express app entry & static file server
│   ├── uploads/                     # Upload directory for CVs and videos
│   ├── .env.example
│   ├── .env
│   └── package.json
│
├── frontend/
│   ├── public/
│   │   └── cutm-logo.svg            # CUTM crest emblem SVG
│   ├── src/
│   │   ├── components/
│   │   │   ├── admin/
│   │   │   │   ├── AdminDashboard.tsx
│   │   │   │   ├── AdminLoginModal.tsx
│   │   │   │   ├── CvManager.tsx
│   │   │   │   ├── FinalVideoManager.tsx
│   │   │   │   ├── QrCodeManager.tsx
│   │   │   │   └── RawVideoManager.tsx
│   │   │   ├── common/
│   │   │   │   ├── BackgroundOrbs.tsx
│   │   │   │   ├── CutmLogo.tsx
│   │   │   │   ├── Modal.tsx
│   │   │   │   ├── Navbar.tsx
│   │   │   │   └── ScrollIndicator.tsx
│   │   │   ├── sections/
│   │   │   │   ├── HeroSection.tsx        # Page 1
│   │   │   │   ├── CvSection.tsx          # Page 2
│   │   │   │   ├── RawVideosSection.tsx   # Page 3
│   │   │   │   └── FinalVideoSection.tsx  # Page 4
│   │   │   └── viewers/
│   │   │       ├── CvViewerModal.tsx
│   │   │       └── VideoPlayerModal.tsx
│   │   ├── context/
│   │   │   └── AuthContext.tsx
│   │   ├── services/
│   │   │   └── api.ts                     # Axios client & typed endpoints
│   │   ├── types/
│   │   │   └── index.ts
│   │   ├── App.tsx                        # Full-screen scroll container
│   │   ├── index.css                      # Tailwind & glassmorphism
│   │   └── main.tsx
│   ├── index.html
│   ├── tailwind.config.js
│   ├── vite.config.ts
│   └── package.json
│
├── .env.example
├── .gitignore
└── README.md
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: v18 or higher (tested on Node v26)
- **npm**: v9 or higher

### 2. Installation

Clone or open the project folder in your terminal:

```bash
# 1. Install Backend Dependencies
cd backend
npm install

# 2. Install Frontend Dependencies
cd ../frontend
npm install
```

---

## ⚙️ Environment Variables

Create `.env` in the `backend/` directory (a pre-configured `.env` is already created):

```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# Admin Authentication
ADMIN_USERNAME=team03
ADMIN_PASSWORD=shupriju
JWT_SECRET=cutm_team03_super_secret_jwt_key_2026_video_resume

# Database (MongoDB connection string)
MONGODB_URI=mongodb://localhost:27017/cutm_video_resume

# Storage Provider (local / cloudinary)
STORAGE_PROVIDER=local
```

---

## 🏃 Running the Application

### Start the Backend Server:
```bash
cd backend
npm run dev
# Server runs on: http://localhost:5000
```

### Start the Frontend Dev Server:
```bash
cd frontend
npm run dev
# Website runs on: http://localhost:5173
```

Open your browser and navigate to **`http://localhost:5173`**.

---

## 🔐 Admin Access & Credentials

| Credential | Value |
|---|---|
| **Username** | `team03` |
| **Password** | `shupriju` |

1. Click the discreet **`ADMIN`** button in the top right navbar.
2. Enter the credentials above and click **"Sign In to Dashboard"**.
3. Manage all team resumes, raw video slots, final video presentation, and QR codes.

---

## 📤 Managing Content

### 1. Uploading CVs / Resumes (Page 2)
- In Admin Dashboard, navigate to **"CV Management"**.
- Click **"Upload CV Document"** for:
  - Shubham Kumar Jha
  - Priyatam Raj
  - Jisu Kumar Thakur
- Supported formats: `.pdf`, `.doc`, `.docx`.
- The public website updates immediately with **"View CV"** and **"Download File"** buttons.

### 2. Uploading Raw Videos (Page 3)
- Navigate to **"Raw Videos"** tab.
- Upload unedited video clips for **Raw Video 01**, **Raw Video 02**, and **Raw Video 03**.
- Supported formats: `.mp4`, `.webm`, `.mov` (up to 500MB).
- Features in-browser video preview, replace, and delete.

### 3. Uploading Final Video Resume (Page 4)
- Navigate to **"Final Video"** tab.
- Upload the master cut MP4/WebM video presentation.
- The public final section will immediately display the cinematic video player with custom play/pause, seekbar, volume, and fullscreen controls.

### 4. Dynamic QR Codes
- Navigate to **"QR Codes"** tab.
- Preview dynamic QR codes for **Raw Videos** and **Final Video**.
- Click **"Download PNG"** to export high-resolution (1000x1000px) print-ready QR codes for project banners and submission reports.
- Click **"Copy Public URL"** to share direct links.

---

## 🌐 Production Deployment

### Backend Deployment (Render / Railway / Heroku):
1. Set the root directory to `backend/`.
2. Build command: `npm install`.
3. Start command: `node src/server.js`.
4. Add environment variables from `.env.example` in your hosting dashboard.

### Frontend Deployment (Vercel / Netlify):
1. Set root directory to `frontend/`.
2. Build command: `npm run build`.
3. Output directory: `dist`.
4. Set `VITE_API_URL` to your deployed backend URL (e.g. `https://your-api.onrender.com/api`).

---

## 👥 Team 03 Credits

- **Shubham Kumar Jha** — *Lead & Full Stack Developer*
- **Priyatam Raj** — *System Architect & Backend Specialist*
- **Jisu Kumar Thakur** — *UI/UX Designer & Frontend Engineer*
- **Institution:** Centurion University of Technology and Management (CUTM)
- **Year:** 2026
