import React, { useState } from 'react';
import { apiService } from './api';
import './App.css';

function App() {
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  // Generate a unique transaction ID
  const generateTransactionId = () => {
    return `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  // Handle KYC verification start
  const handleStartKYC = async () => {
    // Validate full name
    if (!fullName.trim()) {
      setError('Please enter your full name');
      return;
    }

    setError('');
    setLoading(true);
    setResult(null);

    const transactionId = generateTransactionId();

    try {
      console.log('🚀 Starting KYC verification...');
      console.log('Transaction ID:', transactionId);
      console.log('Full Name:', fullName);

      // Step 1: Get auth token from backend
      console.log('📝 Step 1: Fetching auth token from backend...');
      const authResponse = await apiService.getAuthToken(transactionId);
      
      if (!authResponse.data || !authResponse.data.authToken) {
        throw new Error('Failed to get auth token from backend');
      }

      const { authToken } = authResponse.data;
      console.log('✅ Auth token received:', authToken);
      console.log('📄 Full auth response:', authResponse.data);

      // Step 2: Initialize HyperVerge SDK
      console.log('🔧 Step 2: Initializing HyperVerge SDK...');
      
      // Get workflow ID from environment or use the one from backend
      const workflowId = import.meta.env.VITE_HYPERVERGE_WORKFLOW_ID || 'H9s1g3_28_01_26_11_38_13';
      
      const hyperKycConfig = new HyperKycConfig(
        authToken,
        workflowId,
        transactionId,
        true // Show landing page
      );

      // Set inputs required by workflow
      console.log('📝 Step 3: Setting workflow inputs...');
      hyperKycConfig.setInputs({
        Username: fullName // Pass the full name as Username input
      });

      console.log('🚀 Step 4: Launching HyperVerge SDK...');
      
      // Launch SDK with callback handler
      await HyperKYCModule.launch(hyperKycConfig, async (HyperKycResult) => {
        console.log('📊 SDK Result:', HyperKycResult);
        
        setLoading(false);
        
        // Handle different status codes
        switch (HyperKycResult.status) {
          case 'auto_approved':
            console.log('✅ KYC Auto Approved');
            setResult({
              status: 'success',
              title: 'Verification Successful!',
              message: 'Your identity has been verified successfully.',
              data: HyperKycResult
            });
            
            // Fetch detailed outputs from backend
            try {
              console.log('📞 Fetching outputs from backend...');
              const outputs = await apiService.getOutputs(transactionId);
              console.log('📦 ============ OUTPUTS RESPONSE ============');
              console.log('📊 Logs (Results API):', outputs.data.logs);
              console.log('📋 Outputs (Outputs API):', outputs.data.outputs);
              console.log('==========================================');
              setResult(prev => ({ ...prev, outputs: outputs.data }));
            } catch (err) {
              console.error('❌ Error fetching outputs:', err);
            }
            break;

          case 'auto_declined':
            console.log('❌ KYC Auto Declined');
            setResult({
              status: 'declined',
              title: 'Verification Failed',
              message: 'We could not verify your identity. Please try again or contact support.',
              data: HyperKycResult
            });
            break;

          case 'needs_review':
            console.log('⏳ KYC Needs Review');
            setResult({
              status: 'review',
              title: 'Under Review',
              message: 'Your application is under manual review. We will notify you once the review is complete.',
              data: HyperKycResult
            });
            break;

          case 'user_cancelled':
            console.log('🚫 User Cancelled');
            setResult({
              status: 'cancelled',
              title: 'Verification Cancelled',
              message: 'You cancelled the verification process. Click below to try again.',
              data: HyperKycResult
            });
            break;

          case 'error':
            console.error('❌ SDK Error:', HyperKycResult);
            setResult({
              status: 'error',
              title: 'Technical Error',
              message: `An error occurred: ${HyperKycResult.message || 'Unknown error'}`,
              data: HyperKycResult
            });
            break;

          default:
            console.warn('⚠️ Unknown status:', HyperKycResult.status);
            setResult({
              status: 'unknown',
              title: 'Unknown Status',
              message: 'An unexpected status was returned. Please contact support.',
              data: HyperKycResult
            });
        }
      });

    } catch (err) {
      console.error('❌ Error in KYC flow:', err);
      setLoading(false);
      setError(err.response?.data?.message || err.message || 'Failed to start verification. Please try again.');
    }
  };

  // Reset and start new verification
  const handleTryAgain = () => {
    setResult(null);
    setError('');
    setFullName('');
  };

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="logo">
          <div className="logo-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L3 7V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V7L12 2Z" fill="#10B981"/>
              <path d="M10 17L6 13L7.41 11.59L10 14.17L16.59 7.58L18 9L10 17Z" fill="white"/>
            </svg>
          </div>
          <span className="logo-text">
            Sure<span className="logo-highlight">Guard</span> Life
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        {!result ? (
          <div className="kyc-card">
            <div className="card-icon">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                <circle cx="24" cy="24" r="24" fill="#10B981" fillOpacity="0.1"/>
                <path d="M24 14C19.58 14 16 17.58 16 22C16 24.03 16.79 25.87 18.08 27.25L24 34L29.92 27.25C31.21 25.87 32 24.03 32 22C32 17.58 28.42 14 24 14ZM24 24C22.9 24 22 23.1 22 22C22 20.9 22.9 20 24 20C25.1 20 26 20.9 26 22C26 23.1 25.1 24 24 24Z" fill="#10B981"/>
              </svg>
            </div>

            <h1 className="card-title">Digital KYC Verification</h1>
            <p className="card-subtitle">Complete your identity verification in minutes</p>

            {error && (
              <div className="error-message">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="fullName" className="form-label">
                Full Name <span className="required">*</span>
              </label>
              <input
                type="text"
                id="fullName"
                className="form-input"
                placeholder="Enter your full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={loading}
              />
            </div>

            <button
              className="btn-primary"
              onClick={handleStartKYC}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Processing...
                </>
              ) : (
                <>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Start KYC Verification
                </>
              )}
            </button>

            <div className="footer-info">
              <div className="powered-by">POWERED BY HYPERVERGE</div>
              <div className="features">
                <div className="feature">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="#10B981">
                    <path d="M8 0L2 3V7C2 11.03 4.67 14.62 8 15.5C11.33 14.62 14 11.03 14 7V3L8 0Z"/>
                  </svg>
                  Secure
                </div>
                <div className="feature">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="#10B981">
                    <path d="M8 2C4.69 2 2 4.69 2 8C2 11.31 4.69 14 8 14C11.31 14 14 11.31 14 8C14 4.69 11.31 2 8 2ZM8 12C5.79 12 4 10.21 4 8C4 5.79 5.79 4 8 4C10.21 4 12 5.79 12 8C12 10.21 10.21 12 8 12Z"/>
                  </svg>
                  Fast
                </div>
                <div className="feature">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="#10B981">
                    <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z"/>
                  </svg>
                  Accurate
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="result-card">
            <div className={`result-icon ${result.status}`}>
              {result.status === 'success' && (
                <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
                  <circle cx="32" cy="32" r="32" fill="#10B981"/>
                  <path d="M26 32L30 36L38 28" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
              {result.status === 'declined' && (
                <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
                  <circle cx="32" cy="32" r="32" fill="#EF4444"/>
                  <path d="M24 24L40 40M40 24L24 40" stroke="white" strokeWidth="3" strokeLinecap="round"/>
                </svg>
              )}
              {result.status === 'review' && (
                <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
                  <circle cx="32" cy="32" r="32" fill="#F59E0B"/>
                  <path d="M32 20V36M32 44H32.02" stroke="white" strokeWidth="3" strokeLinecap="round"/>
                </svg>
              )}
              {(result.status === 'cancelled' || result.status === 'error' || result.status === 'unknown') && (
                <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
                  <circle cx="32" cy="32" r="32" fill="#6B7280"/>
                  <path d="M32 20V36M32 44H32.02" stroke="white" strokeWidth="3" strokeLinecap="round"/>
                </svg>
              )}
            </div>

            <h2 className="result-title">{result.title}</h2>
            <p className="result-message">{result.message}</p>

            {result.data && (
              <div className="result-details">
                <div className="detail-item">
                  <span className="detail-label">Status:</span>
                  <span className={`detail-value status-${result.status}`}>
                    {result.data.status}
                  </span>
                </div>
                {result.data.code && (
                  <div className="detail-item">
                    <span className="detail-label">Code:</span>
                    <span className="detail-value">{result.data.code}</span>
                  </div>
                )}
              </div>
            )}

            <button className="btn-secondary" onClick={handleTryAgain}>
              Start New Verification
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="footer">
        © 2026 SureGuard Life Insurance. All rights reserved.
      </footer>
    </div>
  );
}

export default App;
