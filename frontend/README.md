# Frontend - HyperVerge KYC Integration

Modern React frontend with HyperVerge Web SDK integration for digital KYC verification.

## 🎨 Features

- ✅ Beautiful dark mode UI
- ✅ HyperVerge Web SDK integration
- ✅ Real-time verification flow
- ✅ Result display with status handling
- ✅ Responsive design
- ✅ Network tab inspection ready

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Update `.env` with your workflow ID (if different):

```env
VITE_BACKEND_URL=http://localhost:3000
VITE_HYPERVERGE_WORKFLOW_ID=your_workflow_id_here
```

### 3. Start Development Server

```bash
npm run dev
```

The app will open at `http://localhost:5173`

## 🔄 Integration Flow

```
1. User enters full name
2. Clicks "Start KYC Verification"
3. Frontend calls backend GET /auth
4. Receives auth token
5. Initializes HyperVerge SDK
6. User completes KYC flow
7. SDK returns result
8. Frontend fetches outputs from backend
9. Displays result to user
```

## 📊 SDK Status Handling

The app handles all possible statuses:

- ✅ `auto_approved` - Success message
- ❌ `auto_declined` - Failure message
- ⏳ `needs_review` - Review pending message
- 🚫 `user_cancelled` - Cancellation message
- ❌ `error` - Error message with details

## 🛠️ Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool & dev server
- **Axios** - HTTP client
- **HyperVerge Web SDK** - KYC verification

## 📱 Responsive Design

- Desktop optimized
- Mobile responsive
- Tablet friendly

## 🔍 Network Tab Inspection

Open browser DevTools (F12) → Network tab to inspect:
- Auth token request to backend
- HyperVerge SDK API calls
- Outputs fetch request

## 🎨 UI Components

- Landing page with form
- Loading states
- Success/Error/Review result screens
- Try again functionality

## 🏗️ Project Structure

```
frontend/
├── public/
├── src/
│   ├── App.jsx           # Main component
│   ├── App.css          # Styling
│   ├── api.js           # Backend API calls
│   └── main.jsx         # Entry point
├── index.html           # HTML with SDK script
├── vite.config.js       # Vite configuration
├── package.json         # Dependencies
└── .env                 # Environment variables
```

## 🔐 Security Notes

- Auth tokens fetched from backend only
- No credentials in frontend code
- HTTPS required for production
- CORS enabled for backend communication

## 📝 Build for Production

```bash
npm run build
```

Output in `dist/` folder

## 🌐 Production Deployment

Deploy the `dist/` folder to:
- Netlify
- Vercel
- AWS S3 + CloudFront
- Any static hosting service

Remember to:
1. Update `VITE_BACKEND_URL` to production backend URL
2. Ensure backend CORS allows your frontend domain
3. Use HTTPS

---

**Status**: ✅ Complete and Ready!
