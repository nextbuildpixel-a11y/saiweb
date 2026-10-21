import React, { useState, useEffect } from 'react';
import { companyService } from '../../services/companyService';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Building2, 
  Search, 
  Filter, 
  ExternalLink, 
  BookOpen, 
  ArrowRight, 
  Sparkles,
  Info,
  CheckCircle2
} from 'lucide-react';

function CompanyListPage() {
  const [companies, setCompanies] = useState([]);
  const [search, setSearch] = useState('');
  const [industry, setIndustry] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const loadCompanies = async () => {
    setLoading(true);
    try {
      const data = await companyService.getCompanies(search, industry);
      setCompanies(data);
    } catch (err) {
      console.error('Failed to load companies', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCompanies();
  }, [search, industry]);

  return (
    <div className="space-y-8 font-sans">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-slate-900 via-slate-900 to-purple-950/60 border border-slate-800/80 rounded-2xl p-6 shadow-xl">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20 mb-2">
            <Building2 className="w-3.5 h-3.5" /> Corporate Placement Catalog
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Target Companies & Preparation Guides</h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Explore company-specific interview prep guides, role requirements, and public preparation sources.
          </p>
        </div>
      </div>

      {/* Disclaimer Banner */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 text-xs text-slate-400 flex items-start gap-3">
        <Info className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
        <div>
          <strong className="font-semibold text-slate-200 block">Public Source Notice</strong>
          Company-specific preparation information is compiled from public candidate reports and web prep sources. AI Interview Coach does not claim official endorsement or fixed hiring guarantees.
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search companies by name or technology..."
            className="w-full bg-slate-900/80 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
          />
        </div>

        <select
          value={industry}
          onChange={(e) => setIndustry(e.target.value)}
          className="bg-slate-900/80 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-300 focus:outline-none focus:border-purple-500"
        >
          <option value="">All Industries</option>
          <option value="Technology">Technology</option>
          <option value="Software">Software</option>
          <option value="IT Services">IT Services</option>
        </select>
      </div>

      {/* Company Cards Grid */}
      {loading ? (
        <div className="min-h-[40vh] flex flex-col items-center justify-center space-y-3 text-slate-400">
          <div className="w-8 h-8 border-3 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-semibold">Loading Target Company Profiles...</p>
        </div>
      ) : companies.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {companies.map((c) => (
            <div key={c.id} className="bg-slate-900/80 border border-slate-800 hover:border-purple-500/50 rounded-2xl p-6 space-y-4 shadow-xl flex flex-col justify-between transition-all group">
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-extrabold text-white text-base group-hover:text-purple-400 transition-colors">{c.name}</h3>
                    <span className="text-[11px] font-semibold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20 inline-block mt-1">
                      {c.industry || 'Technology'}
                    </span>
                  </div>
                  {c.website && (
                    <a
                      href={c.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 text-slate-500 hover:text-slate-200 transition-colors"
                      title="Official Careers Site"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>

                <p className="text-slate-400 text-xs line-clamp-2">{c.description}</p>
                
                {c.publicPrepInfo && (
                  <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-3 text-[11px] text-slate-300 space-y-1">
                    <span className="font-semibold text-slate-400 block">Reported Prep Focus:</span>
                    <p className="line-clamp-2 text-slate-400">{c.publicPrepInfo}</p>
                  </div>
                )}
              </div>

              <Link
                to={`/companies/${c.id}`}
                className="w-full py-2.5 bg-slate-800 hover:bg-purple-600 text-slate-200 hover:text-white rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
              >
                <BookOpen className="w-3.5 h-3.5" /> View Prep Guide & Roles <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-8 text-center space-y-2 text-slate-500">
          <Building2 className="w-10 h-10 mx-auto text-slate-600" />
          <p className="text-xs">No companies found matching search criteria.</p>
        </div>
      )}
    </div>
  );
}

export default CompanyListPage;
