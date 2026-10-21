import api from './api';

export const authService = {
  registerStudent: async (studentData) => {
    const response = await api.post('/auth/user/register', studentData);
    return response.data;
  },

  loginStudent: async (credentials) => {
    const response = await api.post('/auth/user/login', credentials);
    return response.data;
  },

  loginAdmin: async (credentials) => {
    const response = await api.post('/auth/admin/login', credentials);
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get('/user/profile');
    return response.data;
  },

  updateProfile: async (profileData) => {
    const response = await api.put('/user/profile', profileData);
    return response.data;
  }
};

