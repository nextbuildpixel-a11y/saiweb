import api from './api';

export const jobRoleService = {
  getJobRoles: async () => {
    const response = await api.get('/job-roles');
    return response.data;
  },

  createJobRole: async (data) => {
    const response = await api.post('/admin/job-roles', data);
    return response.data;
  },

  updateJobRole: async (id, data) => {
    const response = await api.put(`/admin/job-roles/${id}`, data);
    return response.data;
  },

  deleteJobRole: async (id) => {
    const response = await api.delete(`/admin/job-roles/${id}`);
    return response.data;
  }
};
