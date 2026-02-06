require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors());

// Configuration
const HYPERVERGE_CONFIG = {
  appId: process.env.HYPERVERGE_APP_ID,
  appKey: process.env.HYPERVERGE_APP_KEY,
  workflowId: process.env.HYPERVERGE_WORKFLOW_ID,
  tokenExpiry: parseInt(process.env.TOKEN_EXPIRY) || 1800, // 30 minutes default
  authUrl: 'https://ind-state.idv.hyperverge.co/v2/auth/token',
  logsUrl: 'https://ind.idv.hyperverge.co/v1/link-kyc/results',
  outputUrl: 'https://ind.idv.hyperverge.co/v1/output'
};

// Validate configuration
if (!HYPERVERGE_CONFIG.appId || !HYPERVERGE_CONFIG.appKey || !HYPERVERGE_CONFIG.workflowId) {
  console.error('❌ Error: Missing HyperVerge credentials. Please check your .env file.');
  console.error('Required: HYPERVERGE_APP_ID, HYPERVERGE_APP_KEY, HYPERVERGE_WORKFLOW_ID');
  process.exit(1);
}

// ==========================================
// 1️⃣ AUTH API - GET /auth
// ==========================================
/**
 * Generates a short-lived HyperVerge auth token for SDK initialization
 * @param {string} transactionId - Unique identifier for the user journey
 * @returns {object} Auth token with 30-minute validity
 */
app.get('/auth', async (req, res) => {
  try {
    let { transactionId } = req.query;

    // Auto-generate transactionId if not provided
    if (!transactionId) {
      transactionId = `demo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      console.log(`📝 No transactionId provided, auto-generated: ${transactionId}`);
    }

    console.log(`📝 Generating auth token for transactionId: ${transactionId}`);

    // Call HyperVerge Authentication API
    const response = await axios.post(HYPERVERGE_CONFIG.authUrl, {
      appId: HYPERVERGE_CONFIG.appId,
      appKey: HYPERVERGE_CONFIG.appKey,
      expiry: HYPERVERGE_CONFIG.tokenExpiry,
      transactionId: transactionId,
      workflowId: HYPERVERGE_CONFIG.workflowId
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Auth token generated successfully');

    res.json({
      status: 'success',
      data: {
        authToken: response.data.result.authToken,
        transactionId: transactionId,
        expiresIn: HYPERVERGE_CONFIG.tokenExpiry
      }
    });

  } catch (error) {
    console.error('❌ Error generating auth token:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      status: 'error',
      message: 'Failed to generate auth token',
      error: error.response?.data || error.message
    });
  }
});

// ==========================================
// 2️⃣ RESULTS API - GET /results (Browser view)
// ==========================================
/**
 * View results/logs in browser - GET version for testing
 */
app.get('/results', async (req, res) => {
  try {
    const { transactionId } = req.query;

    if (!transactionId) {
      return res.status(400).json({
        success: false,
        status: 'error',
        message: 'transactionId is required as query parameter'
      });
    }

    console.log(`🔍 Fetching logs for transactionId: ${transactionId}`);

    // Call HyperVerge Results (Logs) API
    const logsResponse = await axios.post(
      HYPERVERGE_CONFIG.logsUrl,
      { transactionId: transactionId },
      {
        headers: {
          'Content-Type': 'application/json',
          'appId': HYPERVERGE_CONFIG.appId,
          'appKey': HYPERVERGE_CONFIG.appKey
        }
      }
    );

    console.log('✅ Logs fetched successfully');
    console.log('📊 Application Status:', logsResponse.data.result?.applicationStatus);

    res.json({
      success: true,
      transactionId: transactionId,
      data: logsResponse.data
    });

  } catch (error) {
    console.error('❌ Error fetching logs:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      success: false,
      status: 'error',
      message: 'Failed to fetch logs',
      error: error.response?.data || error.message
    });
  }
});

// ==========================================
// 2️⃣ RESULTS WEBHOOK - POST /results
// ==========================================
/**
 * Receives webhook event from HyperVerge after transaction completion
 * Extracts transactionId and fetches transaction logs
 */
app.post('/results', async (req, res) => {
  try {
    const webhookPayload = req.body;
    
    console.log('📨 Webhook received:', JSON.stringify(webhookPayload, null, 2));

    const { transactionId, eventType, applicationStatus, eventTime } = webhookPayload;

    if (!transactionId) {
      console.error('❌ Missing transactionId in webhook payload');
      return res.status(400).json({
        status: 'error',
        message: 'transactionId is required in webhook payload'
      });
    }

    console.log(`🔍 Fetching logs for transactionId: ${transactionId}`);
    console.log(`   Event Type: ${eventType}`);
    console.log(`   Status: ${applicationStatus}`);
    console.log(`   Time: ${eventTime}`);

    // Call HyperVerge Results (Logs) API
    const logsResponse = await axios.post(
      HYPERVERGE_CONFIG.logsUrl,
      {
        transactionId: transactionId
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'appId': HYPERVERGE_CONFIG.appId,
          'appKey': HYPERVERGE_CONFIG.appKey
        }
      }
    );

    console.log('✅ Logs fetched successfully');
    console.log('📊 Application Status:', logsResponse.data.result?.applicationStatus);
    console.log('==========================================');
    console.log('📝 LOGS API RESPONSE:');
    console.log(JSON.stringify(logsResponse.data, null, 2));
    console.log('==========================================');

    // Store or log the response (you can add database storage here)

    // Respond to HyperVerge with 200 OK
    res.status(200).json({
      status: 'success',
      message: 'Webhook received and processed'
    });

  } catch (error) {
    console.error('❌ Error processing webhook:', error.response?.data || error.message);
    
    // Still return 200 to HyperVerge to acknowledge receipt
    res.status(200).json({
      status: 'acknowledged',
      message: 'Webhook received but processing failed',
      error: error.message
    });
  }
});

// ==========================================
// 3️⃣ OUTPUTS API - GET /outputs (Browser view)
// ==========================================
/**
 * View outputs in browser - GET version for testing
 */
app.get('/outputs', async (req, res) => {
  try {
    const { transactionId } = req.query;

    if (!transactionId) {
      return res.status(400).json({
        success: false,
        status: 'error',
        message: 'transactionId is required as query parameter'
      });
    }

    console.log(`📤 Fetching outputs for transactionId: ${transactionId}`);

    // Step 1: Call Results (Logs) API
    console.log('🔍 Step 1: Fetching transaction logs...');
    const logsResponse = await axios.post(
      HYPERVERGE_CONFIG.logsUrl,
      { transactionId: transactionId },
      {
        headers: {
          'Content-Type': 'application/json',
          'appId': HYPERVERGE_CONFIG.appId,
          'appKey': HYPERVERGE_CONFIG.appKey
        }
      }
    );

    console.log('✅ Logs fetched successfully');

    // Step 2: Call Outputs API
    console.log('🔍 Step 2: Fetching outputs...');
    const outputsResponse = await axios.post(
      HYPERVERGE_CONFIG.outputUrl,
      {
        transactionId: transactionId,
        workflowId: HYPERVERGE_CONFIG.workflowId,
        sendDebugInfo: 'yes',
        sendAllDebugInfo: 'yes'
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'appId': HYPERVERGE_CONFIG.appId,
          'appKey': HYPERVERGE_CONFIG.appKey
        }
      }
    );

    console.log('✅ Outputs fetched successfully');
    console.log('📊 Status:', outputsResponse.data.result?.status);

    // Return combined response
    res.json({
      success: true,
      transactionId: transactionId,
      data: {
        status: 'success',
        statusCode: 200,
        metadata: outputsResponse.data.metadata,
        result: outputsResponse.data.result
      }
    });

  } catch (error) {
    console.error('❌ Error fetching outputs:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      success: false,
      status: 'error',
      message: 'Failed to fetch outputs',
      error: error.response?.data || error.message
    });
  }
});

// ==========================================
// 3️⃣ OUTPUTS API - POST /outputs (Original)
// ==========================================
/**
 * Fetches final KYC outputs for a completed transaction
 * Called by frontend after SDK completion
 */
app.post('/outputs', async (req, res) => {
  try {
    const { transactionId } = req.body;

    if (!transactionId) {
      return res.status(400).json({
        status: 'error',
        message: 'transactionId is required in request body'
      });
    }

    console.log(`📤 Fetching outputs for transactionId: ${transactionId}`);

    // Step 1: Call Results (Logs) API
    console.log('🔍 Step 1: Fetching transaction logs...');
    const logsResponse = await axios.post(
      HYPERVERGE_CONFIG.logsUrl,
      {
        transactionId: transactionId
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'appId': HYPERVERGE_CONFIG.appId,
          'appKey': HYPERVERGE_CONFIG.appKey
        }
      }
    );

    console.log('✅ Logs fetched successfully');

    // Step 2: Call Outputs API
    console.log('🔍 Step 2: Fetching outputs...');
    const outputsResponse = await axios.post(
      HYPERVERGE_CONFIG.outputUrl,
      {
        transactionId: transactionId,
        workflowId: HYPERVERGE_CONFIG.workflowId,
        sendDebugInfo: 'yes',
        sendAllDebugInfo: 'yes'
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'appId': HYPERVERGE_CONFIG.appId,
          'appKey': HYPERVERGE_CONFIG.appKey
        }
      }
    );

    console.log('✅ Outputs fetched successfully');
    console.log('📊 Status:', outputsResponse.data.result?.status);

    // Return combined response
    res.json({
      status: 'success',
      data: {
        logs: logsResponse.data.result,
        outputs: outputsResponse.data.result
      }
    });

  } catch (error) {
    console.error('❌ Error fetching outputs:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      status: 'error',
      message: 'Failed to fetch outputs',
      error: error.response?.data || error.message
    });
  }
});

// ==========================================
// ROOT ENDPOINT - API INFO
// ==========================================
app.get('/', (req, res) => {
  res.json({
    name: 'HyperVerge Backend Server',
    version: '1.0.0',
    status: 'running',
    timestamp: new Date().toISOString(),
    endpoints: {
      auth: 'GET /auth?transactionId=xxx',
      results: 'POST /results (webhook)',
      outputs: 'POST /outputs',
      health: 'GET /health',
      webhookData: 'GET /webhook-data?transactionId=xxx'
    },
    documentation: {
      readme: 'See backend/README.md',
      webhookFlow: 'See WEBHOOK_FLOW.md',
      setupGuide: 'See SETUP_GUIDE.md'
    },
    config: {
      appId: HYPERVERGE_CONFIG.appId ? 'Configured ✓' : 'Missing ✗',
      workflowId: HYPERVERGE_CONFIG.workflowId ? 'Configured ✓' : 'Missing ✗',
      tokenExpiry: `${HYPERVERGE_CONFIG.tokenExpiry} seconds`
    }
  });
});

// ==========================================
// HEALTH CHECK
// ==========================================
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    config: {
      appId: HYPERVERGE_CONFIG.appId ? '✓ Set' : '✗ Missing',
      appKey: HYPERVERGE_CONFIG.appKey ? '✓ Set' : '✗ Missing',
      workflowId: HYPERVERGE_CONFIG.workflowId ? '✓ Set' : '✗ Missing',
      tokenExpiry: `${HYPERVERGE_CONFIG.tokenExpiry} seconds`
    }
  });
});

// ==========================================
// START SERVER
// ==========================================
app.listen(PORT, () => {
  console.log('\n🚀 HyperVerge Backend Integration Server Started');
  console.log('='.repeat(50));
  console.log(`📍 Server running on: http://localhost:${PORT}`);
  console.log('='.repeat(50));
  console.log('\n📋 Available Endpoints:');
  console.log(`   GET  /health                - Health check`);
  console.log(`   GET  /auth?transactionId=X  - Generate auth token`);
  console.log(`   POST /results               - Webhook listener`);
  console.log(`   POST /outputs               - Fetch outputs`);
  console.log('\n💡 Next Steps:');
  console.log('   1. Update .env file with your HyperVerge credentials');
  console.log('   2. Install dependencies: npm install');
  console.log('   3. Start ngrok: ngrok http 3000');
  console.log('   4. Configure webhook URL in HyperVerge dashboard');
  console.log('='.repeat(50) + '\n');
});
