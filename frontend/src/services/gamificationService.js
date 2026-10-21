import api from './api';

export const gamificationService = {
  getProfile: async () => {
    const response = await api.get('/gamification/profile');
    return response.data;
  },

  awardXp: async (activity, xpAmount, refId) => {
    const response = await api.post('/gamification/award-xp', { activity, xpAmount, refId });
    return response.data;
  }
};
