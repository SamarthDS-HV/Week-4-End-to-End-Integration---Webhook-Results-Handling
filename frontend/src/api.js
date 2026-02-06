import axios from 'axios';

const BACKEND_URL = 'http://localhost:3000';

export const apiService = {
  /**
   * Get auth token from backend for HyperVerge SDK initialization
   * @param {string} transactionId - Unique identifier for the user journey
   * @returns {Promise} Auth token response
   */
  async getAuthToken(transactionId) {
    try {
      const response = await axios.get(`${BACKEND_URL}/auth`, {
        params: { transactionId }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching auth token:', error);
      throw error;
    }
  },

  /**
   * Fetch outputs after KYC completion
   * @param {string} transactionId - Transaction identifier
   * @returns {Promise} Outputs response with logs and results
   */
  async getOutputs(transactionId) {
    try {
      const response = await axios.post(`${BACKEND_URL}/outputs`, {
        transactionId
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching outputs:', error);
      throw error;
    }
  }
};
