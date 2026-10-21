import api from './api';

export const placementPrepService = {
  getQuestions: async (category, difficulty) => {
    const params = {};
    if (category) params.category = category;
    if (difficulty) params.difficulty = difficulty;
    const response = await api.get('/aptitude/questions', { params });
    return response.data;
  },

  submitTestAttempt: async (category, answers) => {
    const response = await api.post('/aptitude/submit', { category, answers });
    return response.data;
  },

  getCodingProblems: async (topic, difficulty) => {
    const params = {};
    if (topic) params.topic = topic;
    if (difficulty) params.difficulty = difficulty;
    const response = await api.get('/coding/problems', { params });
    return response.data;
  },

  submitCodeSolution: async (problemId, code) => {
    const response = await api.post(`/coding/problems/${problemId}/submit`, { code });
    return response.data;
  },

  evaluateStar: async (questionText, answerText) => {
    const response = await api.post('/behavioral/evaluate-star', { questionText, answerText });
    return response.data;
  }
};
