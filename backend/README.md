# HyperVerge Backend Integration

Complete backend server implementation for HyperVerge SDK integration with webhook and results handling.

## 🎯 Features

- **Auth Token Generation** - Generates short-lived SDK auth tokens (30-minute validity)
- **Webhook Listener** - Receives and processes HyperVerge transaction completion events
- **Results & Outputs Fetching** - Retrieves transaction logs and final KYC outputs
- **Public Access Ready** - Designed for ngrok exposure or cloud deployment

## 📋 Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- HyperVerge account with credentials (appId, appKey, workflowId)
- ngrok (for local development) or cloud hosting service

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Credentials

Copy `.env.example` to `.env` and update with your HyperVerge credentials:

```bash
cp .env.example .env
```

Edit `.env`:
```env
HYPERVERGE_APP_ID=your_actual_app_id
HYPERVERGE_APP_KEY=your_actual_app_key
HYPERVERGE_WORKFLOW_ID=your_actual_workflow_id
PORT=3000
TOKEN_EXPIRY=1800
```

### 3. Start the Server

```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

### 4. Expose Server Publicly (Option A - Local + Ngrok)

In a new terminal:
```bash
ngrok http 3000
```

Copy the HTTPS URL provided by ngrok (e.g., `https://abc123.ngrok.io`)

### 5. Configure Webhook in HyperVerge Dashboard

1. Go to HyperVerge Dashboard
2. Navigate to webhook configuration
3. Set webhook URL to: `https://your-ngrok-url.ngrok.io/results`
4. Subscribe to events:
   - `FINISH_TRANSACTION_WEBHOOK`
   - `MANUAL_REVIEW_STATUS_UPDATE`
   - `INTERMEDIATE_TRANSACTION_WEBHOOK`

## 📡 API Endpoints

### 1️⃣ GET /auth

Generates a short-lived HyperVerge auth token for SDK initialization.

**Request:**
```bash
GET /auth?transactionId=unique_user_id_123
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "authToken": "eyJhbGc...",
    "transactionId": "unique_user_id_123",
    "expiresIn": 1800
  }
}
```

**Usage in Frontend:**
Use the returned `authToken` to initialize the HyperVerge SDK.

---

### 2️⃣ POST /results

Webhook endpoint that receives transaction completion events from HyperVerge.

**HyperVerge sends:**
```json
{
  "eventType": "FINISH_TRANSACTION_WEBHOOK",
  "eventTime": "2024-02-04T12:48:32.346Z",
  "applicationStatus": "auto_approved",
  "transactionId": "unique_user_id_123",
  "eventId": "evt_123"
}
```

**Backend actions:**
1. Receives webhook payload
2. Extracts `transactionId`
3. Calls HyperVerge Results (Logs) API
4. Logs the transaction details
5. Returns HTTP 200 OK

**Response:**
```json
{
  "status": "success",
  "message": "Webhook received and processed"
}
```

---

### 3️⃣ POST /outputs

Fetches final KYC outputs and transaction logs. Called by frontend after SDK completion.

**Request:**
```bash
POST /outputs
Content-Type: application/json

{
  "transactionId": "unique_user_id_123"
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "logs": {
      "workflowDetails": {...},
      "applicationStatus": "auto_approved",
      "userDetails": {...},
      "results": [...]
    },
    "outputs": {
      "flags": [...],
      "userDetails": {...},
      "status": "auto_approved",
      "transactionId": "unique_user_id_123"
    }
  }
}
```

---

### 🏥 GET /health

Health check endpoint to verify server status and configuration.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-02-04T12:00:00.000Z",
  "config": {
    "appId": "✓ Set",
    "appKey": "✓ Set",
    "workflowId": "✓ Set",
    "tokenExpiry": "1800 seconds"
  }
}
```

## 🔄 Integration Flow

```
1. Frontend requests auth token
   └─> GET /auth?transactionId=user123
       └─> Backend generates token
           └─> Returns authToken to Frontend

2. Frontend initializes HyperVerge SDK with authToken
   └─> User completes KYC flow

3. HyperVerge sends webhook
   └─> POST /results (webhook from HyperVerge)
       └─> Backend fetches logs
           └─> Stores/logs transaction data

4. Frontend requests results
   └─> POST /outputs {transactionId}
       └─> Backend fetches logs + outputs
           └─> Returns combined data to Frontend
```

## 🔐 Security Notes

- Never expose `.env` file or commit it to version control
- HyperVerge APIs require IP whitelisting - whitelist your server IP in HyperVerge Dashboard
- Auth tokens expire after 30 minutes (configurable)
- Use HTTPS in production (ngrok provides this automatically)

## 📊 Application Status Values

- `auto_approved` - Automatically approved by workflow
- `auto_declined` - Automatically declined by workflow
- `needs_review` - Requires manual review
- `manually_approved` - Manually approved via dashboard
- `manually_declined` - Manually declined via dashboard
- `kyc_in_progress` - KYC process ongoing
- `user_cancelled` - User cancelled the flow
- `error` - An error occurred

## 🧪 Testing

### Test Auth Endpoint
```bash
curl "http://localhost:3000/auth?transactionId=test123"
```

### Test Webhook (simulate HyperVerge webhook)
```bash
curl -X POST http://localhost:3000/results \
  -H "Content-Type: application/json" \
  -d '{
    "eventType": "FINISH_TRANSACTION_WEBHOOK",
    "eventTime": "2024-02-04T12:48:32.346Z",
    "applicationStatus": "auto_approved",
    "transactionId": "test123",
    "eventId": "evt_123"
  }'
```

### Test Outputs Endpoint
```bash
curl -X POST http://localhost:3000/outputs \
  -H "Content-Type: application/json" \
  -d '{"transactionId": "test123"}'
```

## 🐛 Debugging

Server logs include detailed information:
- 📝 Auth token generation
- 📨 Webhook reception
- 🔍 API calls to HyperVerge
- ✅ Successful operations
- ❌ Error details

Check console output for real-time debugging.

## 📚 API Documentation References

- [HyperVerge Authentication API](https://documentation.hyperverge.co/other-resources/authentication)
- [Results (Logs) API](https://documentation.hyperverge.co/accessing-results/results-api)
- [Outputs API](https://documentation.hyperverge.co/accessing-results/output_api)
- [Webhook Documentation](https://documentation.hyperverge.co/accessing-results/webhook)

## 🚢 Deployment Options

### Option A: Local + Ngrok (Development)
```bash
# Terminal 1
npm start

# Terminal 2
ngrok http 3000
```

### Option B: Cloud Deployment (Production)

Deploy to your preferred platform:
- AWS (EC2, Lambda, ECS)
- Google Cloud Platform
- Azure
- Heroku
- DigitalOcean
- Vercel/Netlify (with serverless functions)

Remember to:
1. Set environment variables in your hosting platform
2. Whitelist your server's public IP in HyperVerge Dashboard
3. Use HTTPS
4. Update webhook URL in HyperVerge Dashboard

## 🛠️ Tech Stack

- **Node.js** - Runtime environment
- **Express** - Web framework
- **Axios** - HTTP client for API calls
- **dotenv** - Environment variable management
- **cors** - Cross-origin resource sharing

## 📝 License

ISC

## 👥 Support

For HyperVerge-specific issues:
- Email: support@hyperverge.co
- Documentation: https://documentation.hyperverge.co

---

**Ready to integrate the frontend?** Let me know when you have the HyperVerge Web SDK documentation!
