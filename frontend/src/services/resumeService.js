import api from './api';

export const resumeService = {
  uploadResume: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/resumes/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getLatestResume: async () => {
    const response = await api.get('/resumes/latest');
    return response.data;
  },

  getResumeHistory: async () => {
    const response = await api.get('/resumes/history');
    return response.data;
  },

  analyzeResume: async (id) => {
    const response = await api.post(`/resumes/${id}/analyze`);
    return response.data;
  }
};
