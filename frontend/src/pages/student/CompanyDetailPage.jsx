import React, { useState, useEffect } from 'react';
import { companyService } from '../../services/companyService';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Building2, 
  Briefcase, 
  BookOpen, 
  ExternalLink, 
  ArrowLeft, 
  PlayCircle, 
  CheckCircle2, 
  Award, 
  Info,
  Sparkles
} from 'lucide-react';

function CompanyDetailPage() {
  const { id } = useParams();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCompany = async () => {
      setLoading(true);
      try {
        const data = await companyService.getCompanyDetails(id);
        setCompany(data);
        if (data.availableRoles && data.availableRoles.length > 0) {
          setSelectedRole(data.availableRoles[0]);
        }
      } catch (err) {
        console.error('Failed to fetch company details', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCompany();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-3 text-purple-400">
        <div className="w-8 h-8 border-3 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-semibold">Loading Target Company Preparation Guide...</p>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-8 text-center space-y-4 max-w-lg mx-auto my-12">
        <Building2 className="w-12 h-12 text-slate-600 mx-auto" />
        <h2 className="text-lg font-bold text-white">Company Profile Not Found</h2>
        <Link to="/companies" className="text-xs text-purple-400 hover:underline">Back to Company Catalog</Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-sans">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-purple-950/60 border border-slate-800/80 rounded-2xl p-6 shadow-xl space-y-3">
        <button
          onClick={() => navigate('/companies')}
          className="text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Companies
        </button>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20 mb-2">
              {company.industry || 'Technology Enterprise'}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">{company.name}</h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-1">{company.description}</p>
          </div>

          <button
            onClick={() => navigate('/interview/setup')}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-xs shadow-lg shadow-blue-600/25 transition-all flex items-center gap-2 cursor-pointer shrink-0"
          >
            <PlayCircle className="w-4 h-4" /> Start {company.name} Mock Interview
          </button>
        </div>
      </div>

      {/* Public Source Disclaimer Banner */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 text-xs text-slate-400 flex items-start gap-3">
        <Info className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
        <div>
          <strong className="font-semibold text-slate-200 block">Public Information Notice</strong>
          {company.disclaimer}
        </div>
      </div>

      {/* Two Column Layout: Mapped Roles & Preparation Guide */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Available Roles Selector */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
          <h3 className="font-bold text-white text-sm flex items-center gap-2 border-b border-slate-800/80 pb-3">
            <Briefcase className="w-4 h-4 text-purple-400" /> Target Roles ({company.availableRoles?.length || 0})
          </h3>

          <div className="space-y-2">
            {company.availableRoles?.map((role) => (
              <div
                key={role.companyRoleId}
                onClick={() => setSelectedRole(role)}
                className={`p-3.5 rounded-xl border text-xs cursor-pointer transition-all ${
                  selectedRole?.companyRoleId === role.companyRoleId
                    ? 'bg-purple-600/15 border-purple-500/50 text-white shadow-md'
                    : 'bg-slate-950/80 border-slate-800 text-slate-300 hover:bg-slate-800/50'
                }`}
              >
                <div className="flex justify-between items-center font-bold mb-1">
                  <span>{role.roleTitle}</span>
                  <span className="text-[10px] font-semibold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                    {role.difficultyLevel}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-2">{role.roleDescription}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Selected Role Skill Requirements & Prep Sources */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 lg:col-span-2 space-y-6 shadow-xl">
          {selectedRole ? (
            <>
              <div className="flex justify-between items-center border-b border-slate-800/80 pb-3">
                <div>
                  <h3 className="font-bold text-white text-base">{selectedRole.roleTitle}</h3>
                  <span className="text-xs text-slate-400">Target Role Requirements at {company.name}</span>
                </div>
                <span className="text-xs font-bold text-purple-400 bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20">
                  {selectedRole.difficultyLevel} DIFFICULTY
                </span>
              </div>

              {/* Required Skills Matrix */}
              <div className="space-y-3">
                <h4 className="font-bold text-slate-200 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-purple-400" /> Required Skills & Importance Matrix
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {selectedRole.requiredSkills?.map((s, idx) => (
                    <div key={idx} className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-3.5 text-xs space-y-1">
                      <div className="flex justify-between font-bold text-white">
                        <span>{s.skillName}</span>
                        <span className="text-emerald-400">{s.importance}</span>
                      </div>
                      <div className="flex justify-between text-[11px] text-slate-400">
                        <span>Category: {s.category}</span>
                        <span>Level: {s.requiredLevel}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Reported Public Preparation Sources */}
              {company.preparationSources && company.preparationSources.length > 0 && (
                <div className="space-y-3 pt-4 border-t border-slate-800/80">
                  <h4 className="font-bold text-slate-200 text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-blue-400" /> Public Candidate Preparation Sources
                  </h4>
                  <div className="space-y-2">
                    {company.preparationSources.map((src) => (
                      <div key={src.id} className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-3.5 text-xs space-y-1">
                        <div className="flex justify-between font-bold text-slate-200">
                          <span>{src.sourceTitle}</span>
                          {src.sourceUrl && (
                            <a href={src.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline flex items-center gap-1">
                              Source Link <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400">{src.descriptionNotes}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12 text-slate-500 text-xs">
              Select a target role on the left to view skill requirements and preparation guides.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CompanyDetailPage;
