import api from './api';

export const jobDescriptionService = {
  analyzeJobDescription: async (formData) => {
    const response = await api.post('/job-descriptions/analyze', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getJobDescriptionHistory: async () => {
    const response = await api.get('/job-descriptions/history');
    return response.data;
  },

  getJobDescriptionById: async (id) => {
    const response = await api.get(`/job-descriptions/${id}`);
    return response.data;
  }
};
