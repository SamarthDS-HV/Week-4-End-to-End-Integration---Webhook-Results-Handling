# 🚀 Complete Setup & Testing Guide

## Overview

This guide walks you through setting up and testing the complete HyperVerge KYC integration system.

## Prerequisites Checklist

- [x] Node.js installed (v14+)
- [x] HyperVerge credentials (appId, appKey, workflowId)
- [x] Ngrok installed (for local testing)
- [x] Browser with DevTools (Chrome/Firefox recommended)

## Step-by-Step Setup

### 1️⃣ Backend Setup

```bash
# Navigate to backend folder
cd backend

# Install dependencies
npm install

# Configure credentials - Edit .env file with your actual credentials
# HYPERVERGE_APP_ID=your_app_id
# HYPERVERGE_APP_KEY=your_app_key
# HYPERVERGE_WORKFLOW_ID=your_workflow_id

# Start backend server
npm run dev
```

**Expected Output:**
```
🚀 HyperVerge Backend Integration Server Started
📍 Server running on: http://localhost:3000
```

### 2️⃣ Expose Backend with Ngrok

Open a new terminal:

```bash
ngrok http 3000
```

**Copy the HTTPS URL** (e.g., `https://pyramidical-alesia-semipeacefully.ngrok-free.dev`)

### 3️⃣ Configure Webhook

In another terminal, run:

```bash
curl -X PUT 'https://review-api.idv.hyperverge.co/api/v1/config' \
  --header 'appid: YOUR_APP_ID' \
  --header 'appkey: YOUR_APP_KEY' \
  --header 'Content-Type: application/json' \
  --data '{
    "webhookUrl": "YOUR_NGROK_URL/results",
    "events": ["FINISH_TRANSACTION_WEBHOOK", "MANUAL_REVIEW_STATUS_UPDATE", "INTERMEDIATE_TRANSACTION_WEBHOOK"]
  }'
```

Replace:
- `YOUR_APP_ID` with your actual appId
- `YOUR_APP_KEY` with your actual appKey  
- `YOUR_NGROK_URL` with your ngrok URL

### 4️⃣ Frontend Setup

Open a new terminal:

```bash
# Navigate to frontend folder
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

**Expected Output:**
```
VITE ready in XXX ms
Local: http://localhost:5173
```

Browser should automatically open to `http://localhost:5173`

## 🧪 Testing the Integration

### Test 1: Health Check

```bash
curl http://localhost:3000/health
```

**Expected Response:**
```json
{
  "status": "healthy",
  "config": {
    "appId": "✓ Set",
    "appKey": "✓ Set",
    "workflowId": "✓ Set"
  }
}
```

### Test 2: Auth Token Generation

```bash
curl "http://localhost:3000/auth?transactionId=test123"
```

**Expected Response:**
```json
{
  "status": "success",
  "data": {
    "authToken": "eyJhbGc...",
    "transactionId": "test123",
    "expiresIn": 1800
  }
}
```

### Test 3: Complete KYC Flow

1. **Open Frontend:** Navigate to `http://localhost:5173`

2. **Enter Full Name:** Type any name in the form

3. **Click "Start KYC Verification"**

4. **Open Browser DevTools:**
   - Press `F12` or `Cmd+Option+I` (Mac)
   - Go to **Network** tab
   - Filter by "Fetch/XHR"

5. **Complete the KYC Flow:**
   - Follow HyperVerge SDK instructions
   - Upload documents
   - Complete liveness check
   - Wait for result

6. **Observe Network Calls:**
   - `GET /auth` - Auth token request
   - HyperVerge API calls
   - `POST /outputs` - Final results fetch

7. **Check Backend Logs:**
   - Watch Terminal 1 (backend server)
   - You should see webhook reception logs
   - Transaction processing logs

8. **Verify Webhook:**
   - Check Ngrok web interface at `http://127.0.0.1:4040`
   - See incoming webhook POST request
   - Verify 200 OK response

### Test 4: Check Results

After completing KYC, the frontend should display one of:

- ✅ **Success** - "Verification Successful!"
- ❌ **Declined** - "Verification Failed"  
- ⏳ **Under Review** - "Under Review"
- 🚫 **Cancelled** - "Verification Cancelled"
- ⚠️ **Error** - Error message with details

## 🔍 Debugging Checklist

### Backend Issues

**Server won't start:**
- ✓ Check if port 3000 is available
- ✓ Verify .env file exists with correct credentials
- ✓ Run `npm install` again

**Auth token errors:**
- ✓ Verify credentials in .env are correct
- ✓ Check IP whitelisting in HyperVerge dashboard
- ✓ Ensure credentials format is correct (no quotes)

**Webhook not receiving:**
- ✓ Verify ngrok is running
- ✓ Check webhook URL configuration
- ✓ Look at ngrok web interface (http://127.0.0.1:4040)
- ✓ Verify webhook events are subscribed

### Frontend Issues

**SDK not loading:**
- ✓ Check browser console for errors
- ✓ Verify HyperVerge SDK script loaded in Network tab
- ✓ Ensure HTTPS is used (ngrok provides this)

**Auth token fetch fails:**
- ✓ Verify backend is running on port 3000
- ✓ Check CORS settings in backend
- ✓ Look at Network tab for error details

**SDK initialization fails:**
- ✓ Verify workflowId is correct
- ✓ Check auth token is valid
- ✓ Look at browser console for SDK errors

### Network Inspection

**Key Network Calls to Observe:**

1. **GET http://localhost:3000/auth**
   - Status: 200 OK
   - Response contains: authToken, transactionId

2. **HyperVerge SDK Calls**
   - Multiple calls to HyperVerge APIs
   - Check for 401/403 errors (auth issues)

3. **POST http://localhost:3000/outputs**
   - Status: 200 OK
   - Response contains: logs and outputs data

4. **Webhook (in Ngrok interface)**
   - POST /results
   - From HyperVerge servers
   - Status: 200 OK

## 📊 Expected Flow Diagram

```
User Opens Frontend (localhost:5173)
    ↓
Enters Name & Clicks "Start KYC"
    ↓
Frontend → Backend GET /auth
    ↓
Backend → HyperVerge Auth API
    ↓
Backend ← Auth Token
    ↓
Frontend ← Auth Token
    ↓
Frontend Initializes HyperVerge SDK
    ↓
User Completes KYC Flow
    ↓
HyperVerge → Backend POST /results (webhook)
    ↓
Backend Logs Transaction
    ↓
Frontend Gets SDK Result
    ↓
Frontend → Backend POST /outputs
    ↓
Backend → HyperVerge APIs (Logs + Outputs)
    ↓
Frontend ← Complete Results
    ↓
Display Result to User
```

## 🎯 Success Criteria

- [ ] Backend server running on port 3000
- [ ] Ngrok exposing backend publicly
- [ ] Webhook configured in HyperVerge
- [ ] Frontend running on port 5173
- [ ] Health check returns ✓ Set for all configs
- [ ] Can generate auth tokens
- [ ] SDK loads and initializes
- [ ] Can complete KYC flow
- [ ] Webhook received in backend logs
- [ ] Results displayed in frontend
- [ ] All network calls visible in DevTools

## 🎉 You're All Set!

Once all checkboxes above are completed, your HyperVerge KYC integration is fully functional!

## 📞 Support

If you encounter issues:

1. Check console logs (backend & frontend)
2. Inspect Network tab for failed requests
3. Verify credentials and configuration
4. Contact HyperVerge support: support@hyperverge.co

---

**Happy Testing!** 🚀
