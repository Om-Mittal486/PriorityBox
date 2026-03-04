# 📧 MailWatch — Real-time Email Monitoring Dashboard

A modern full-stack web application that lets you monitor important emails in real-time. Log in with Google, add sender email addresses you care about, and get instant dashboard updates when new emails arrive.

![Tech Stack](https://img.shields.io/badge/React-Vite-blue) ![Backend](https://img.shields.io/badge/Node.js-Express-green) ![DB](https://img.shields.io/badge/MongoDB-Atlas-brightgreen) ![API](https://img.shields.io/badge/Gmail-API-red)

---

## ✨ Features

- **Google OAuth 2.0** — Secure login with Gmail
- **Sender Management** — Add, edit, delete tracked email addresses
- **Real-time Email Monitoring** — Polls Gmail every 30s for new emails
- **Live Dashboard Updates** — Socket.io pushes new emails instantly
- **Dark / Light Mode** — Toggle with localStorage persistence
- **Email Preview** — View full email content in a modal
- **Read/Unread Status** — Mark emails as read/unread
- **Notification Sound** — Audio alert on new emails
- **Browser Notifications** — Desktop notifications for new arrivals
- **Responsive Design** — Works on mobile, tablet, and desktop

---

## 🏗️ Project Structure

```
mailwatch/
├── backend/
│   ├── config/         # Database configuration
│   ├── controllers/    # Route handlers
│   ├── middleware/      # JWT auth middleware
│   ├── models/         # Mongoose schemas
│   ├── routes/         # Express routes
│   ├── services/       # Gmail API & polling services
│   ├── utils/          # Encryption utilities
│   ├── server.js       # Entry point
│   ├── package.json
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── components/ # Reusable UI components
│   │   ├── context/    # React context providers
│   │   ├── pages/      # Page components
│   │   └── services/   # API client
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   └── .env.example
│
└── README.md
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** v18+ and npm
- **MongoDB Atlas** account (free tier works)
- **Google Cloud Console** project with Gmail API enabled

### 1. Clone & Install

```bash
# Clone the repo
git clone <your-repo-url>
cd mailwatch

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Set Up MongoDB Atlas

1. Go to [MongoDB Atlas](https://cloud.mongodb.com/) and create a free account
2. Create a new cluster (free tier M0)
3. Go to **Database Access** → Add a database user with password
4. Go to **Network Access** → Add `0.0.0.0/0` to allow all IPs (or your specific IP)
5. Go to **Databases** → Click **Connect** → **Connect your application**
6. Copy the connection string — it looks like:
   ```
   mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/mailwatch?retryWrites=true&w=majority
   ```

### 3. Set Up Gmail API (Step-by-Step)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select existing)
3. **Enable Gmail API**:
   - Go to **APIs & Services** → **Library**
   - Search for "Gmail API" → Click **Enable**
4. **Configure OAuth Consent Screen**:
   - Go to **APIs & Services** → **OAuth consent screen**
   - Select **External** user type
   - Fill in app name: `MailWatch`
   - Add your email as support & developer contact
   - On **Scopes** page, add:
     - `https://www.googleapis.com/auth/gmail.readonly`
     - `https://www.googleapis.com/auth/userinfo.profile`
     - `https://www.googleapis.com/auth/userinfo.email`
   - Add your email as a **Test user** (required while app is in testing)
   - Complete the setup
5. **Create OAuth Credentials**:
   - Go to **APIs & Services** → **Credentials**
   - Click **Create Credentials** → **OAuth client ID**
   - Application type: **Web application**
   - Authorized redirect URIs:
     - `http://localhost:5000/api/auth/google/callback` (development)
     - `https://your-backend-url.onrender.com/api/auth/google/callback` (production)
   - Copy the **Client ID** and **Client Secret**

### 4. Configure Environment Variables

**Backend** (`backend/.env`):
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/mailwatch
GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REDIRECT_URI=http://localhost:5000/api/auth/google/callback
JWT_SECRET=your_random_jwt_secret_32chars
JWT_EXPIRES_IN=7d
ENCRYPTION_KEY=your_random_32_character_key_here
FRONTEND_URL=http://localhost:5173
POLLING_INTERVAL=30000
```

> 💡 Generate random secrets: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

**Frontend** (`frontend/.env`):
```env
VITE_API_URL=http://localhost:5000
```

### 5. Run Development Servers

```bash
# Terminal 1 — Backend
cd backend
npm run dev

# Terminal 2 — Frontend
cd frontend
npm run dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:5000
- Health check: http://localhost:5000/api/health

---

## 🌐 Deployment

### Backend → Render

1. Push code to GitHub
2. Go to [Render](https://render.com/) → **New Web Service**
3. Connect your GitHub repo, select the `backend` folder path
4. Settings:
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Environment**: Node
5. Add all environment variables from `.env.example`
   - Update `GOOGLE_REDIRECT_URI` to `https://your-app.onrender.com/api/auth/google/callback`
   - Update `FRONTEND_URL` to your Vercel URL
6. Deploy!

### Frontend → Vercel

1. Go to [Vercel](https://vercel.com/) → **New Project**
2. Import your GitHub repo
3. Settings:
   - **Root Directory**: `frontend`
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add environment variable:
   - `VITE_API_URL` = `https://your-backend.onrender.com`
5. Add a `vercel.json` in `frontend/`:
   ```json
   { "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
   ```
6. Deploy!

### Post-Deployment

- Update Google Cloud Console **Authorized redirect URIs** with your production backend URL
- Add your production frontend URL to the backend's `FRONTEND_URL` env var
- Add your production URLs to CORS settings if needed

---

## 🔐 Security

- OAuth tokens are **AES encrypted** before storing in MongoDB
- JWT tokens expire in 7 days (configurable)
- API keys are **never exposed** on the frontend
- Rate limiting (100 requests / 15 minutes)
- Helmet.js for HTTP security headers
- CORS restricted to frontend origin

---

## 📡 API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/auth/google` | ❌ | Get Google OAuth URL |
| GET | `/api/auth/google/callback` | ❌ | OAuth callback |
| GET | `/api/auth/me` | ✅ | Get user profile |
| POST | `/api/auth/logout` | ✅ | Logout |
| GET | `/api/senders` | ✅ | List tracked senders |
| POST | `/api/senders` | ✅ | Add sender |
| PUT | `/api/senders/:id` | ✅ | Update sender |
| DELETE | `/api/senders/:id` | ✅ | Delete sender |
| GET | `/api/emails` | ✅ | List emails (paginated) |
| GET | `/api/emails/:id` | ✅ | Get single email |
| PATCH | `/api/emails/:id/read` | ✅ | Toggle read/unread |
| PATCH | `/api/emails/mark-all-read` | ✅ | Mark all as read |
| GET | `/api/health` | ❌ | Health check |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS v4 |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas, Mongoose |
| Auth | Google OAuth 2.0, JWT |
| Real-time | Socket.io |
| Email | Gmail API |
| Encryption | CryptoJS (AES) |

---

## 📄 License

MIT — built with ❤️ for your resume.
