import api from './api';

const API_BASE_URL = '/batches';

export const batchService = {
  // Get all batches
  getAllBatches: async (params = {}) => {
    try {
      const response = await api.get(API_BASE_URL, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching batches:', error);
      throw error;
    }
  },

  // Get batches by department IDs
  getBatchesByDepartments: async (departmentIds) => {
    try {
      const response = await api.post(`${API_BASE_URL}/by-departments`, {
        departmentIds
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching batches by departments:', error);
      throw error;
    }
  },

  // Get active batches for a specific department
  getActiveBatchesForDepartment: async (departmentId) => {
    try {
      const response = await api.get(`${API_BASE_URL}/department/${departmentId}/active`);
      return response.data;
    } catch (error) {
      console.error('Error fetching active batches for department:', error);
      throw error;
    }
  },

  // Get batch by ID
  getBatchById: async (id) => {
    try {
      const response = await api.get(`${API_BASE_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching batch:', error);
      throw error;
    }
  },

  // Create new batch (admin only)
  createBatch: async (batchData) => {
    try {
      const response = await api.post(API_BASE_URL, batchData);
      return response.data;
    } catch (error) {
      console.error('Error creating batch:', error);
      throw error;
    }
  },

  // Update batch (admin only)
  updateBatch: async (id, batchData) => {
    try {
      const response = await api.put(`${API_BASE_URL}/${id}`, batchData);
      return response.data;
    } catch (error) {
      console.error('Error updating batch:', error);
      throw error;
    }
  },

  // Delete batch (admin only)
  deleteBatch: async (id) => {
    try {
      const response = await api.delete(`${API_BASE_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting batch:', error);
      throw error;
    }
  }
};

export default batchService;
