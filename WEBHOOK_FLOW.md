# HyperVerge Webhook Flow - Simple Explanation

## 📚 What is a Webhook?

Think of a webhook as a **notification system** or **doorbell**.

**Real-world analogy:**
- When you order food online, the restaurant doesn't call you every 5 minutes asking "Are you hungry yet?"
- Instead, when your food is ready, they **notify you** (ring your doorbell)
- A webhook works the same way: HyperVerge **notifies your server** when something important happens

**Traditional way (Polling):**
```
Your Server: "Is KYC done?"  → HyperVerge: "No"
Your Server: "Is KYC done?"  → HyperVerge: "No"
Your Server: "Is KYC done?"  → HyperVerge: "No"
Your Server: "Is KYC done?"  → HyperVerge: "Yes!"
❌ Wastes resources, slow, inefficient
```

**Webhook way:**
```
User completes KYC → HyperVerge: "Hey server, KYC is done!" 
✅ Instant, efficient, real-time
```

---

## 🔄 Complete Flow in Our Project

### **Visual Flow Diagram**

```
┌─────────────────────────────────────────────────────────────────┐
│ STEP 1: USER STARTS KYC                                         │
└─────────────────────────────────────────────────────────────────┘
                              ↓
    ┌──────────────────────────────────────────┐
    │  Frontend (React App)                    │
    │  - User enters name                      │
    │  - Clicks "Start KYC Verification"       │
    └──────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ STEP 2: GET AUTH TOKEN                                          │
└─────────────────────────────────────────────────────────────────┘
                              ↓
    Frontend  ──────GET /auth─────→  Backend Server
                                           ↓
                                    Calls HyperVerge Auth API
                                           ↓
    Frontend  ←────Auth Token──────  Backend Server
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ STEP 3: USER COMPLETES KYC PROCESS                              │
└─────────────────────────────────────────────────────────────────┘
                              ↓
    ┌──────────────────────────────────────────┐
    │  HyperVerge SDK (in browser)             │
    │  - Document upload                       │
    │  - Face capture                          │
    │  - Liveness check                        │
    │  - Processing...                         │
    └──────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ STEP 4: 🔔 WEBHOOK TRIGGERED (REAL-TIME NOTIFICATION)          │
└─────────────────────────────────────────────────────────────────┘
                              ↓
    HyperVerge Server  ───POST /results (webhook)───→  Your Backend
                         (Sends transaction details)
                                                              ↓
                                                    ┌─────────────────┐
                                                    │ Webhook Handler │
                                                    │ Receives:       │
                                                    │ - transactionId │
                                                    │ - eventType     │
                                                    │ - status        │
                                                    │ - timestamp     │
                                                    └─────────────────┘
                                                              ↓
                                            Backend calls Logs API
                                            (Fetches detailed results)
                                                              ↓
                                            Backend logs the data
                                            (Can store in database)
                                                              ↓
                                            Responds 200 OK to HyperVerge
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ STEP 5: FRONTEND GETS RESULTS                                   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
    Frontend  ───POST /outputs───→  Backend Server
               (Sends transactionId)
                                           ↓
                                    Calls Logs API + Outputs API
                                           ↓
    Frontend  ←────Results Data────  Backend Server
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ STEP 6: DISPLAY RESULTS TO USER                                 │
└─────────────────────────────────────────────────────────────────┘
    ✅ Auto Approved
    ❌ Auto Declined
    ⏳ Needs Review
```

---

## 🎯 Webhook in This Project - Detailed Breakdown

### **When Does the Webhook Get Triggered?**

The webhook is triggered in **3 scenarios**:

1. **FINISH_TRANSACTION_WEBHOOK**
   - When user completes the entire KYC flow
   - When SDK finishes processing
   - Status: `auto_approved`, `auto_declined`, or `needs_review`

2. **MANUAL_REVIEW_STATUS_UPDATE**
   - When an admin manually approves/declines on HyperVerge dashboard
   - After human review of flagged applications

3. **INTERMEDIATE_TRANSACTION_WEBHOOK**
   - When application is submitted successfully
   - While still being processed by the system

---

### **What Information Does the Webhook Send?**

```json
{
  "eventType": "FINISH_TRANSACTION_WEBHOOK",
  "eventTime": "2024-02-04T12:48:32.346Z",
  "applicationStatus": "auto_approved",
  "transactionId": "txn_1770226771344_xq8o7mst1",
  "eventId": "evt_12345"
}
```

**Key fields:**
- `transactionId` - Unique ID for this user's KYC journey
- `eventType` - What happened?
- `applicationStatus` - Result (approved/declined/review)
- `eventTime` - When it happened

---

### **What Happens After Webhook is Triggered?**

**In our backend server (`POST /results` endpoint):**

```
1. Receive webhook from HyperVerge
   ↓
2. Extract transactionId from payload
   ↓
3. Log the event (print to console)
   ↓
4. Call HyperVerge Logs API
   (Get detailed transaction data)
   ↓
5. Store/Log the complete results
   (In production: save to database)
   ↓
6. Send 200 OK response to HyperVerge
   (Confirms we received the webhook)
```

**Code in our project:**
```javascript
// backend/server.js - Lines 119-158
app.post('/results', async (req, res) => {
  // 1. Receive webhook
  const webhookPayload = req.body;
  
  // 2. Extract data
  const { transactionId, eventType, applicationStatus } = webhookPayload;
  
  // 3. Log it
  console.log('📨 Webhook received:', webhookPayload);
  
  // 4. Fetch detailed logs
  const logsResponse = await axios.post(LOGS_API, {
    transactionId: transactionId
  });
  
  // 5. Log complete data (can store in DB here)
  console.log('📝 Complete logs:', logsResponse.data);
  
  // 6. Acknowledge receipt
  res.status(200).json({ status: 'success' });
});
```

---

## 🔐 Webhook Security & Configuration

### **Webhook URL Configuration**

Our webhook URL must be:
- **Publicly accessible** (that's why we use ngrok)
- **HTTPS** (secure connection)
- **Whitelisted** with HyperVerge

**Our webhook URL:**
```
https://pyramidical-alesia-semipeacefully.ngrok-free.dev/results
```

### **How We Configured It**

Using HyperVerge API:
```bash
curl -X PUT 'https://review-api.idv.hyperverge.co/api/v1/config' \
  --header 'appid: YOUR_APP_ID' \
  --header 'appkey: YOUR_APP_KEY' \
  --data '{
    "webhookUrl": "YOUR_NGROK_URL/results",
    "events": [
      "FINISH_TRANSACTION_WEBHOOK",
      "MANUAL_REVIEW_STATUS_UPDATE", 
      "INTERMEDIATE_TRANSACTION_WEBHOOK"
    ]
  }'
```

---

## 💡 Why Use Webhooks? (Benefits)

### **1. Real-Time Updates**
- Get notified instantly when KYC completes
- No waiting or polling
- Immediate action possible

### **2. Resource Efficient**
- Your server doesn't constantly check for updates
- Saves CPU, bandwidth, and API calls
- Scales better

### **3. Backend-Only Processing**
- Critical data goes directly to your secure server
- Not exposed to frontend/browser
- Better security

### **4. Reliability**
- Even if frontend closes, backend still receives updates
- User can close browser, webhook still arrives
- No lost notifications

### **5. Audit Trail**
- Every KYC completion is logged
- Can track all transactions
- Complete history maintained

---

## 🔍 Verifying Webhook Reception

### **Where to Check?**

**1. Backend Terminal/Console:**
```
📨 Webhook received: {...}
🔍 Fetching logs for transactionId: txn_...
✅ Logs fetched successfully
📊 Application Status: auto_approved
```

**2. Ngrok Web Interface (http://127.0.0.1:4040):**
- See incoming POST requests
- View request/response details
- Check timing and status codes

**3. Backend Logs File:**
- Can redirect console output to file
- Permanent record of all webhooks
- Useful for debugging

---

## 🚨 What If Webhook Fails?

### **Failure Scenarios:**

1. **Backend Server Down**
   - Webhook cannot be delivered
   - HyperVerge may retry (check their retry policy)
   - Lost webhook if server stays down

2. **Wrong Webhook URL**
   - 404 Not Found error
   - Check configuration
   - Update webhook URL in HyperVerge

3. **Network Issues**
   - Timeout errors
   - Ngrok disconnected
   - Firewall blocking

4. **Backend Returns Error**
   - Our code crashes
   - Returns 500 error
   - HyperVerge sees failure

### **Our Safety Measures:**

```javascript
// Always return 200 OK, even if processing fails
try {
  // Process webhook
  const logsResponse = await fetchLogs(transactionId);
  res.status(200).json({ status: 'success' });
} catch (error) {
  // Still acknowledge receipt
  res.status(200).json({ 
    status: 'acknowledged',
    message: 'Webhook received but processing failed' 
  });
}
```

**Why?** HyperVerge knows we received it, won't retry unnecessarily.

---

## 📊 Webhook vs Manual API Calls

### **Without Webhook (Manual Polling):**

```javascript
// ❌ Bad approach - polling every 5 seconds
setInterval(async () => {
  const result = await checkKYCStatus(transactionId);
  if (result.status === 'completed') {
    // Finally got the result!
  }
}, 5000);
```

**Problems:**
- 100+ API calls for one KYC
- Delays (could take 5+ seconds to know)
- Wastes resources
- Rate limiting issues

### **With Webhook (Event-Driven):**

```javascript
// ✅ Good approach - event-driven
app.post('/results', (req, res) => {
  // Instant notification when KYC completes!
  const { transactionId, status } = req.body;
  processKYCCompletion(transactionId, status);
  res.status(200).send('OK');
});
```

**Benefits:**
- 1 webhook call per KYC
- Instant notification
- Efficient and scalable
- Real-time updates

---

## 🎓 Explaining to Non-Technical Person

**Simple Explanation:**

> "Imagine you're waiting for a package delivery. 
> 
> **Without webhook:** You'd have to check your door every 5 minutes to see if it arrived. Exhausting!
> 
> **With webhook:** The delivery person rings your doorbell when they arrive. You only check when notified!
> 
> That's what webhooks do - HyperVerge 'rings our server's doorbell' when KYC is complete, instead of us constantly checking."

---

## 📝 Summary for Integration Explanation

### **Key Points to Cover:**

1. **What:** Webhook = Real-time notification from HyperVerge to our server

2. **When:** Triggered when user completes KYC or status changes

3. **Where:** Sent to our backend endpoint `POST /results`

4. **Why:** Instant updates, efficient, reliable, secure

5. **How:** 
   - HyperVerge sends POST request with transaction details
   - Our backend receives and processes it
   - We fetch complete logs and store them
   - Send confirmation back to HyperVerge

6. **Benefits:** 
   - No polling needed
   - Real-time updates
   - Backend-only (secure)
   - Complete audit trail

---

## 🔗 Related Files in Project

- **Backend Webhook Handler:** `backend/server.js` (Line 119-158)
- **Webhook Configuration:** See `backend/README.md`
- **API Documentation:** See `SETUP_GUIDE.md`

---

**Document Version:** 1.0  
**Last Updated:** February 4, 2026  
**Project:** HyperVerge KYC Integration
