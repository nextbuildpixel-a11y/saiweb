import React, { useState, useEffect } from 'react';
import { companyService } from '../../services/companyService';
import { jobRoleService } from '../../services/jobRoleService';
import { 
  Building2, 
  Plus, 
  Edit, 
  Trash2, 
  Power, 
  BookOpen, 
  Layers, 
  CheckCircle2, 
  AlertCircle,
  X
} from 'lucide-react';

function AdminCompanyManagementPage() {
  const [companies, setCompanies] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  // Modal States
  const [showCompanyModal, setShowCompanyModal] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  const [companyForm, setCompanyForm] = useState({
    name: '',
    industry: 'Technology',
    description: '',
    website: '',
    publicPrepInfo: ''
  });

  const [showRoleMapModal, setShowRoleMapModal] = useState(false);
  const [roleMapForm, setRoleMapForm] = useState({
    companyId: '',
    jobRoleId: '',
    difficultyLevel: 'HARD',
    roleDescription: ''
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [compData, roleData] = await Promise.all([
        companyService.getCompanies(),
        jobRoleService.getJobRoles()
      ]);
      setCompanies(compData);
      setRoles(roleData);
    } catch (err) {
      setError('Failed to fetch admin company catalog data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenCompanyModal = (company = null) => {
    if (company) {
      setEditingCompany(company);
      setCompanyForm({
        name: company.name || '',
        industry: company.industry || 'Technology',
        description: company.description || '',
        website: company.website || '',
        publicPrepInfo: company.publicPrepInfo || ''
      });
    } else {
      setEditingCompany(null);
      setCompanyForm({
        name: '',
        industry: 'Technology',
        description: '',
        website: '',
        publicPrepInfo: ''
      });
    }
    setShowCompanyModal(true);
  };

  const handleSaveCompany = async (e) => {
    e.preventDefault();
    try {
      if (editingCompany) {
        await companyService.updateCompany(editingCompany.id, companyForm);
        setMessage(`Company '${companyForm.name}' updated successfully.`);
      } else {
        await companyService.createCompany(companyForm);
        setMessage(`Company '${companyForm.name}' created successfully.`);
      }
      setShowCompanyModal(false);
      await loadData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save company profile');
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await companyService.toggleCompanyStatus(id);
      await loadData();
    } catch (err) {
      setError('Failed to toggle company status');
    }
  };

  const handleDeleteCompany = async (id) => {
    if (window.confirm('Are you sure you want to delete this company profile?')) {
      try {
        await companyService.deleteCompany(id);
        setMessage('Company profile deleted successfully.');
        await loadData();
      } catch (err) {
        setError('Failed to delete company profile');
      }
    }
  };

  const handleMapRole = async (e) => {
    e.preventDefault();
    try {
      await companyService.mapRoleToCompany(roleMapForm);
      setMessage('Job Role successfully mapped to Company profile.');
      setShowRoleMapModal(false);
      await loadData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to map role to company');
    }
  };

  return (
    <div className="space-y-8 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-slate-900 via-purple-950/30 to-slate-900 border border-purple-900/40 rounded-2xl p-6 shadow-xl">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Target Companies & Roles Management</h1>
          <p className="text-slate-400 text-xs mt-1">
            Admin console for managing corporate profiles, mapped target roles, and public preparation sources.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleOpenCompanyModal()}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-purple-600/25 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add New Company
          </button>
          <button
            onClick={() => setShowRoleMapModal(true)}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer border border-slate-700"
          >
            <Layers className="w-4 h-4 text-purple-400" /> Map Role to Company
          </button>
        </div>
      </div>

      {message && (
        <div className="bg-emerald-950/60 border border-emerald-800/80 rounded-xl p-4 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="bg-rose-950/60 border border-rose-800/80 rounded-xl p-4 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Companies Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
        <div className="flex justify-between items-center border-b border-slate-800/80 pb-3">
          <h3 className="font-bold text-white text-sm flex items-center gap-2">
            <Building2 className="w-4 h-4 text-purple-400" /> Company Profile Catalog ({companies.length})
          </h3>
        </div>

        {loading ? (
          <div className="text-center py-8 text-xs text-purple-400">Loading catalog...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-3 font-semibold">Company Name</th>
                  <th className="p-3 font-semibold">Industry</th>
                  <th className="p-3 font-semibold">Website</th>
                  <th className="p-3 font-semibold">Status</th>
                  <th className="p-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {companies.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3 font-semibold text-slate-200">{c.name}</td>
                    <td className="p-3 text-slate-400">{c.industry}</td>
                    <td className="p-3 text-purple-400">{c.website || 'N/A'}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${c.status ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                        {c.status ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                    </td>
                    <td className="p-3 flex items-center gap-2">
                      <button
                        onClick={() => handleToggleStatus(c.id)}
                        className="p-1.5 text-slate-400 hover:text-amber-400 transition-colors"
                        title="Toggle Active Status"
                      >
                        <Power className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleOpenCompanyModal(c)}
                        className="p-1.5 text-slate-400 hover:text-blue-400 transition-colors"
                        title="Edit Company Profile"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteCompany(c.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-400 transition-colors"
                        title="Delete Company Profile"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Company Modal */}
      {showCompanyModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-sm">
                {editingCompany ? 'Edit Company Profile' : 'Add New Company Profile'}
              </h3>
              <button onClick={() => setShowCompanyModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCompany} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Company Name</label>
                <input
                  type="text"
                  required
                  value={companyForm.name}
                  onChange={(e) => setCompanyForm({ ...companyForm, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Industry</label>
                <input
                  type="text"
                  value={companyForm.industry}
                  onChange={(e) => setCompanyForm({ ...companyForm, industry: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Company Description</label>
                <textarea
                  rows={3}
                  value={companyForm.description}
                  onChange={(e) => setCompanyForm({ ...companyForm, description: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-purple-500"
                ></textarea>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Official Careers Website</label>
                <input
                  type="text"
                  value={companyForm.website}
                  onChange={(e) => setCompanyForm({ ...companyForm, website: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCompanyModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-semibold hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-500 shadow-lg shadow-purple-600/25"
                >
                  Save Company
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Role Mapping Modal */}
      {showRoleMapModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-sm">Map Job Role to Target Company</h3>
              <button onClick={() => setShowRoleMapModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleMapRole} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Select Target Company</label>
                <select
                  required
                  value={roleMapForm.companyId}
                  onChange={(e) => setRoleMapForm({ ...roleMapForm, companyId: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="">Choose Company...</option>
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Select Master Job Role</label>
                <select
                  required
                  value={roleMapForm.jobRoleId}
                  onChange={(e) => setRoleMapForm({ ...roleMapForm, jobRoleId: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="">Choose Job Role...</option>
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>{r.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Difficulty Level</label>
                <select
                  value={roleMapForm.difficultyLevel}
                  onChange={(e) => setRoleMapForm({ ...roleMapForm, difficultyLevel: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="EASY">EASY</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="HARD">HARD</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRoleMapModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-semibold hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-500 shadow-lg shadow-purple-600/25"
                >
                  Map Role
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminCompanyManagementPage;
