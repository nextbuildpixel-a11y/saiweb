import api from './api';

export const placementDriveService = {
  createDrive: async (data) => {
    const response = await api.post('/placement-drives/create', data);
    return response.data;
  },

  getCurrentRound: async (id) => {
    const response = await api.get(`/placement-drives/${id}/current-round`);
    return response.data;
  },

  submitRound: async (id, payload) => {
    const response = await api.post(`/placement-drives/${id}/submit-round`, payload);
    return response.data;
  },

  getDriveReport: async (id) => {
    const response = await api.get(`/placement-drives/${id}/report`);
    return response.data;
  }
};
