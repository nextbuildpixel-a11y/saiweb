import api from './api';

export const interviewService = {
  createInterview: async (data) => {
    const response = await api.post('/interviews/create', data);
    return response.data;
  },

  getCurrentQuestion: async (id) => {
    const response = await api.get(`/interviews/${id}/current-question`);
    return response.data;
  },

  submitAnswer: async (id, answerData) => {
    const payload = typeof answerData === 'string' ? { answerText: answerData, answerType: 'TEXT' } : answerData;
    const response = await api.post(`/interviews/${id}/submit-answer`, payload);
    return response.data;
  },

  uploadVideoFile: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/media/upload-video', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  completeInterview: async (id) => {
    const response = await api.post(`/interviews/${id}/complete`);
    return response.data;
  },

  getInterviewResult: async (id) => {
    const response = await api.get(`/interviews/${id}/result`);
    return response.data;
  },

  getInterviewHistory: async () => {
    const response = await api.get('/interviews/history');
    return response.data;
  }
};
