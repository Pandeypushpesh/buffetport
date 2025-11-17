# Portfolio Website

A modern, minimalist portfolio website built with React (Vite) frontend and Node.js + Express backend. Features a classic, conservative design inspired by Warren Buffett's website with a simple resume delivery system.

## 🎯 Project Overview

This portfolio website allows visitors to request your resume via email. The project consists of:

- **Frontend**: React 18 + Vite with Tailwind CSS
- **Backend**: Node.js + Express with email delivery via Nodemailer
- **Design**: Minimal, professional design with serif typography and generous whitespace
- **Features**: 
  - Contact form with email validation
  - Resume delivery via email attachment or download link
  - Rate limiting and security best practices
  - Analytics integration (Google Analytics / Plausible)

## 📁 Project Structure

```
vibing/
├── frontend/              # React + Vite frontend
│   ├── src/
│   │   ├── components/   # React components
│   │   └── utils/        # Utility functions
│   ├── index.html
│   └── package.json
├── backend/              # Express backend
│   ├── services/         # Email service implementations
│   ├── assets/           # Resume PDF file location
│   ├── server.js         # Express server
│   └── package.json
├── .env.example          # Environment variables template
└── README.md
```

## 🚀 Quick Start

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Git

### Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd vibing
```

2. **Install frontend dependencies**
```bash
cd frontend
npm install
```

3. **Install backend dependencies**
```bash
cd ../backend
npm install
```

4. **Set up environment variables**
```bash
# Copy example file
cp .env.example .env

# Edit .env and add your credentials
# See Environment Variables section below
```

5. **Add resume file**
```bash
# Place your resume.pdf in backend/assets/
cp /path/to/your/resume.pdf backend/assets/resume.pdf
```

## 🏃 Running Locally

### Development Mode

**Terminal 1 - Frontend:**
```bash
cd frontend
npm run dev
```
Frontend runs on `http://localhost:5173`

**Terminal 2 - Backend:**
```bash
cd backend
npm run dev
```
Backend runs on `http://localhost:5000`

### Production Build (Local Testing)

**Frontend:**
```bash
cd frontend
npm run build
npm run preview
```

**Backend:**
```bash
cd backend
npm start
```

## 📝 Environment Variables

### Frontend Environment Variables

Create `.env` in `frontend/` directory:

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `VITE_API_URL` | Backend API URL | No (defaults to proxy) | `http://localhost:5000` |
| `VITE_GA_MEASUREMENT_ID` | Google Analytics ID | No | `G-XXXXXXXXXX` |
| `VITE_PLAUSIBLE_DOMAIN` | Plausible Analytics domain | No | `yourdomain.com` |

### Backend Environment Variables

Create `.env` in `backend/` directory:

#### Server Configuration

| Variable | Description | Required | Default | Example |
|----------|-------------|----------|---------|---------|
| `PORT` | Server port | No | `5000` | `5000` |
| `NODE_ENV` | Environment mode | No | `development` | `production` |
| `FRONTEND_URL` | Frontend URL for CORS | Yes (production) | `http://localhost:5173` | `https://your-site.netlify.app` |

#### Email Configuration (Choose One Method)

**Method 1: SMTP with App Password**

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `SMTP_HOST` | SMTP server hostname | Yes | `smtp.gmail.com` |
| `SMTP_PORT` | SMTP server port | Yes | `587` (TLS) or `465` (SSL) |
| `SMTP_USER` | SMTP username/email | Yes | `your-email@gmail.com` |
| `SMTP_PASS` | SMTP password/app password | Yes | `your-app-password` |
| `FROM_EMAIL` | Sender email address | Yes | `your-email@gmail.com` |

**Method 2: Gmail OAuth2 (Recommended for Production)**

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `GOOGLE_CLIENT_ID` | Google OAuth2 client ID | Yes | `123-abc.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | Google OAuth2 client secret | Yes | `GOCSPX-abc123xyz` |
| `GOOGLE_REFRESH_TOKEN` | OAuth2 refresh token | Yes | `1//abc123xyz...` |
| `FROM_EMAIL` | Sender email address | Yes | `your-email@gmail.com` |

#### Optional Email Customization

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `SENDER_NAME` | Display name for emails | No | `Portfolio Owner` |
| `EMAIL_SUBJECT` | Email subject line | No | `Your Requested Resume` |
| `EMAIL_TEXT` | Plain text email body | No | Default message |
| `EMAIL_HTML` | HTML email body | No | Default HTML template |

### Environment Variables Setup

1. **Copy the example file:**
```bash
cd backend
cp .env.example .env
```

2. **Edit `.env` and fill in your values:**
```env
# Server
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FROM_EMAIL=your-email@gmail.com
```

3. **For Gmail App Password:**
   - Enable 2-Factor Authentication
   - Generate App Password: https://myaccount.google.com/apppasswords
   - Use the 16-character password as `SMTP_PASS`

4. **For OAuth2 (see `backend/EMAIL_SETUP.md` for detailed instructions):**
   - Create Google Cloud project
   - Enable Gmail API
   - Create OAuth2 credentials
   - Generate refresh token using `backend/scripts/getRefreshToken.js`

## 🔧 Development

### Frontend Development

```bash
cd frontend
npm run dev      # Start dev server
npm run build    # Build for production
npm run preview  # Preview production build
```

### Backend Development

```bash
cd backend
npm run dev      # Start with auto-reload
npm start        # Start production server
npm test         # Run tests
```

### Running Tests

```bash
cd backend
npm test                    # Run all tests
npm run test:watch          # Watch mode
npm run test:verbose        # Verbose output
```

See `backend/MANUAL_TEST_CASES.md` for manual testing instructions.

## 📦 Building for Production

### Frontend Build

```bash
cd frontend
npm install
npm run build
```

Output: `frontend/dist/` directory

### Backend Build

No build step required. Ensure:
- All dependencies installed: `npm install`
- Environment variables configured
- Resume PDF in `backend/assets/resume.pdf`

## 🚀 Deployment

### Frontend Deployment

#### Netlify

1. Connect Git repository
2. Build settings:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
   - **Base directory:** `frontend`
3. Environment variables:
   - `VITE_API_URL` = `https://your-backend-url.com`
4. Deploy

#### Vercel

1. Connect Git repository
2. Framework: Vite
3. Root directory: `frontend`
4. Environment variables: `VITE_API_URL`
5. Deploy

### Backend Deployment

#### Render

1. Create new Web Service
2. Build: `cd backend && npm install`
3. Start: `cd backend && npm start`
4. Environment variables:
   - `FRONTEND_URL` = `https://your-frontend-url.com`
   - `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS`, etc.
5. Encrypt sensitive variables

#### Railway

1. Create new project
2. Root directory: `backend`
3. Start command: `npm start`
4. Add environment variables in Variables tab
5. Deploy

#### Heroku

1. Create Heroku app: `heroku create`
2. Set environment variables: `heroku config:set KEY=value`
3. Deploy: `git push heroku main`

### Important: Update CORS

Before deploying backend, ensure `FRONTEND_URL` environment variable is set to your production frontend URL. The backend automatically uses this for CORS configuration.

**Example:**
```env
FRONTEND_URL=https://your-portfolio.netlify.app
```

See `DEPLOYMENT_GUIDE.md` for detailed deployment instructions.

## 📚 Documentation

- **Email Setup**: `backend/EMAIL_SETUP.md` - SMTP and OAuth2 configuration
- **OAuth2 Quick Start**: `backend/OAUTH2_QUICK_START.md` - Quick OAuth2 setup
- **Security**: `backend/SECURITY_CHECKLIST.md` - Security best practices
- **Deployment**: `DEPLOYMENT_GUIDE.md` - Complete deployment guide
- **Testing**: `backend/MANUAL_TEST_CASES.md` - Manual test cases
- **Design Spec**: `DESIGN_SPEC.md` - UI/UX design specifications

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI library
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - (if needed for navigation)

### Backend
- **Node.js** - Runtime environment
- **Express** - Web framework
- **Nodemailer** - Email sending
- **express-rate-limit** - Rate limiting
- **CORS** - Cross-origin resource sharing

## 🔒 Security Features

- ✅ Environment variables for all credentials
- ✅ Rate limiting (5 requests/hour per IP)
- ✅ Input sanitization and validation
- ✅ Secure error logging (no credentials exposed)
- ✅ CORS configuration
- ✅ HTTPS enforcement in production

## 📊 Analytics

Supports:
- **Google Analytics** - Add `VITE_GA_MEASUREMENT_ID`
- **Plausible Analytics** - Add `VITE_PLAUSIBLE_DOMAIN`

See `frontend/ANALYTICS_SETUP.md` for setup instructions.

## 🧪 Testing

### Integration Tests

```bash
cd backend
npm test
```

Tests cover:
- Valid email requests (200)
- Invalid email requests (400)
- Input sanitization
- Response format validation

### Manual Testing

See `backend/MANUAL_TEST_CASES.md` for complete test cases with cURL commands.

## 🐛 Troubleshooting

### CORS Errors

**Problem:** `Access to fetch blocked by CORS policy`

**Solution:**
1. Check `FRONTEND_URL` environment variable is set correctly
2. Ensure backend CORS includes frontend URL
3. Both should use HTTPS in production

### Email Not Sending

**Problem:** Emails not being delivered

**Solution:**
1. Verify SMTP credentials are correct
2. Check email service logs
3. For Gmail: Ensure App Password is used (not regular password)
4. Check rate limiting isn't blocking requests

### Environment Variables Not Loading

**Frontend:**
- Variables must start with `VITE_`
- Rebuild after adding: `npm run build`

**Backend:**
- Restart server after adding variables
- Check variable names match exactly (case-sensitive)

## 📄 License

[Your License Here]

## 👤 Author

[Your Name]

## 🙏 Acknowledgments

- Design inspired by Warren Buffett's website
- Built with modern web technologies

---

For detailed setup instructions, see:
- `backend/EMAIL_SETUP.md` - Email configuration
- `DEPLOYMENT_GUIDE.md` - Deployment steps
- `backend/SECURITY_CHECKLIST.md` - Security practices
