# HyperVerge End-to-End Integration

Complete implementation of HyperVerge KYC integration with backend server and frontend SDK.

## 📁 Project Structure

```
End-To-End Integration Task/
├── backend/                 # Node.js/Express backend server
│   ├── server.js           # Main server with 3 API endpoints
│   ├── package.json        # Backend dependencies
│   ├── .env.example        # Environment variables template
│   ├── .env               # Your credentials (not in git)
│   ├── .gitignore         # Git ignore rules
│   └── README.md          # Backend documentation
│
├── frontend/              # Frontend application (to be implemented)
│   └── (HyperVerge Web SDK integration)
│
└── README.md             # This file
```

## 🎯 Overview

This project implements a complete HyperVerge KYC integration with:

### Backend (`/backend`)
- ✅ **Auth Token Generation** - GET `/auth` endpoint
- ✅ **Webhook Listener** - POST `/results` endpoint  
- ✅ **Results & Outputs API** - POST `/outputs` endpoint
- ✅ Ready for ngrok or cloud deployment

### Frontend (`/frontend`)
- ✅ **React Application** - Modern UI with dark mode
- ✅ **HyperVerge Web SDK** - Integrated and configured
- ✅ **Result Handling** - All status codes handled
- ✅ **Responsive Design** - Mobile & desktop optimized

## 🚀 Quick Start

### Backend Setup

1. Navigate to backend folder:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Configure credentials:
```bash
cp .env.example .env
# Edit .env with your HyperVerge credentials
```

4. Start the server:
```bash
npm start
```

5. Expose publicly with ngrok:
```bash
ngrok http 3000
```

See [`backend/README.md`](backend/README.md) for detailed backend documentation.

### Frontend Setup

1. Navigate to frontend folder:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Update `.env` if needed (workflow ID is already set):
```bash
# .env file
VITE_BACKEND_URL=http://localhost:3000
VITE_HYPERVERGE_WORKFLOW_ID=H9s1g3_28_01_26_11_38_13
```

4. Start the development server:
```bash
npm run dev
```

The app will open at `http://localhost:5173`

See [`frontend/README.md`](frontend/README.md) for detailed frontend documentation.

## 📚 Documentation

- **Backend**: See [backend/README.md](backend/README.md)
- **Frontend**: Coming soon
- **HyperVerge Docs**: https://documentation.hyperverge.co

## 🔄 Integration Flow

```
┌─────────────┐         ┌──────────────┐         ┌──────────────┐
│  Frontend   │────────▶│   Backend    │────────▶│  HyperVerge  │
│             │         │              │         │     API      │
└─────────────┘         └──────────────┘         └──────────────┘
      │                       │                         │
      │ 1. GET /auth          │                         │
      │──────────────────────▶│  Generate token         │
      │                       │────────────────────────▶│
      │                       │                         │
      │ 2. Initialize SDK     │                         │
      │   with auth token     │                         │
      │                       │                         │
      │ 3. User completes KYC │                         │
      │                       │                         │
      │                       │ 4. POST /results        │
      │                       │◀────────────────────────│
      │                       │   (webhook)             │
      │                       │                         │
      │ 5. POST /outputs      │                         │
      │──────────────────────▶│  Fetch results          │
      │                       │────────────────────────▶│
      │◀──────────────────────│                         │
      │   Return data         │                         │
```

## 🛠️ Tech Stack

### Backend
- Node.js
- Express
- Axios
- dotenv
- cors

### Frontend (Planned)
- HyperVerge Web SDK
- HTML/CSS/JavaScript or React (TBD)

## 📝 Next Steps

1. ✅ Backend implementation complete
2. ✅ Frontend implementation complete
3. ⏳ Configure HyperVerge credentials in `backend/.env`
4. ⏳ Test backend endpoints
5. ⏳ Setup ngrok and configure webhook URL
6. ⏳ Start both servers (backend + frontend)
7. ⏳ Complete end-to-end KYC flow
8. ⏳ Inspect Network tab for API calls

## 🚀 Running the Complete System

### Terminal 1 - Backend Server
```bash
cd backend
npm install
npm run dev
```

### Terminal 2 - Ngrok (for webhook)
```bash
ngrok http 3000
```

### Terminal 3 - Frontend Server
```bash
cd frontend
npm install
npm run dev
```

Then open `http://localhost:5173` in your browser and complete a KYC verification!

## 📞 Support

For issues or questions:
- HyperVerge: support@hyperverge.co
- Documentation: https://documentation.hyperverge.co

---

**Status**: Backend ✅ Complete | Frontend ✅ Complete | **Ready for Testing!** 🚀
