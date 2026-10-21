import api from './api';

export const analyticsService = {
  getStudentPerformance: async () => {
    const response = await api.get('/analytics/student/performance');
    return response.data;
  },

  getCompanyReadiness: async () => {
    const response = await api.get('/analytics/student/company-readiness');
    return response.data;
  },

  getAdminOverview: async () => {
    const response = await api.get('/analytics/admin/overview');
    return response.data;
  }
};
