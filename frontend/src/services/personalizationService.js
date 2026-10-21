import api from './api';

export const personalizationService = {
  getWeakAreas: async () => {
    const response = await api.get('/personalization/weak-areas');
    return response.data;
  },

  generatePlan: async (durationDays) => {
    const response = await api.post('/personalization/plans/generate', { durationDays });
    return response.data;
  },

  getCurrentPlan: async () => {
    const response = await api.get('/personalization/plans/current');
    return response.data;
  },

  getDailyQueue: async () => {
    const response = await api.get('/personalization/daily-queue');
    return response.data;
  }
};
