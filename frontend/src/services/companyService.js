import api from './api';

export const companyService = {
  getCompanies: async (search = '', industry = '') => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (industry) params.append('industry', industry);
    const response = await api.get(`/companies?${params.toString()}`);
    return response.data;
  },

  getCompanyDetails: async (id) => {
    const response = await api.get(`/companies/${id}`);
    return response.data;
  },

  createCompany: async (data) => {
    const response = await api.post('/admin/companies', data);
    return response.data;
  },

  updateCompany: async (id, data) => {
    const response = await api.put(`/admin/companies/${id}`, data);
    return response.data;
  },

  deleteCompany: async (id) => {
    const response = await api.delete(`/admin/companies/${id}`);
    return response.data;
  },

  toggleCompanyStatus: async (id) => {
    const response = await api.patch(`/admin/companies/${id}/status`);
    return response.data;
  },

  mapRoleToCompany: async (data) => {
    const response = await api.post('/admin/company-roles', data);
    return response.data;
  },

  addPreparationSource: async (companyId, data) => {
    const response = await api.post(`/admin/companies/${companyId}/sources`, data);
    return response.data;
  }
};
