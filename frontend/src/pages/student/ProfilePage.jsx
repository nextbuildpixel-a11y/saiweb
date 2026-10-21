import React, { useState, useEffect } from 'react';
import { authService } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import {
  User,
  Mail,
  Phone,
  GraduationCap,
  Building,
  Award,
  Calendar,
  Flame,
  Zap,
  Clock,
  PlayCircle,
  Edit3,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Sparkles,
  ShieldCheck,
  Target,
  ArrowRight,
  TrendingUp,
  X,
  Globe,
  ExternalLink,
  Lock,
  Upload,
  Plus,
  Briefcase,
  Code2,
  Check,
  Layers,
  Copy,
  FileText
} from 'lucide-react';

// Custom SVG Icons for GitHub & LinkedIn
const GithubIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
);

const LinkedinIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
  </svg>
);

const PRESET_AVATARS = [
  { id: 'dev1', name: 'Techie Male', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix&backgroundColor=b6e3f4' },
  { id: 'dev2', name: 'Techie Female', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aria&backgroundColor=ffdfbf' },
  { id: 'dev3', name: 'Creative', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Milo&backgroundColor=c0aede' },
  { id: 'dev4', name: 'Pro Hacker', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Byte&backgroundColor=d1d4f9' }
];

const SUGGESTED_SKILLS = [
  'React', 'Node.js', 'Python', 'Java', 'SQL', 'TypeScript',
  'Spring Boot', 'AWS', 'Docker', 'GraphQL', 'System Design', 'Data Structures'
];

function ProfilePage() {
  const { user: authUser, updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('skills'); // 'skills', 'personal', 'social', 'performance'
  
  // Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  // Skill tag input in edit modal
  const [skillTagInput, setSkillTagInput] = useState('');

  // Edit Form Data
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    avatarUrl: '',
    targetRole: '',
    experienceLevel: 'Student',
    targetSkills: [],
    bio: '',
    socialLinks: {
      github: '',
      linkedin: '',
      portfolio: ''
    },
    college: '',
    degree: '',
    branch: '',
    graduationYear: '',
    cgpa: ''
  });

  const loadProfileData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await authService.getProfile();
      setProfile(data);
      populateFormData(data);
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError(err.response?.data?.error || err.message || 'Unable to connect to profile service.');
    } finally {
      setLoading(false);
    }
  };

  const populateFormData = (data) => {
    setFormData({
      fullName: data.fullName || '',
      email: data.email || '',
      phone: data.phone || '',
      avatarUrl: data.avatarUrl || '',
      targetRole: data.targetRole || 'Full Stack Developer',
      experienceLevel: data.experienceLevel || 'Student',
      targetSkills: Array.isArray(data.targetSkills) ? [...data.targetSkills] : [],
      bio: data.bio || '',
      socialLinks: {
        github: data.socialLinks?.github || '',
        linkedin: data.socialLinks?.linkedin || '',
        portfolio: data.socialLinks?.portfolio || ''
      },
      college: data.college || '',
      degree: data.degree || 'B.Tech',
      branch: data.branch || 'Computer Science',
      graduationYear: data.graduationYear || '2026',
      cgpa: data.cgpa || ''
    });
  };

  useEffect(() => {
    loadProfileData();
  }, []);

  const handleCopyEmail = () => {
    if (profile?.email) {
      navigator.clipboard.writeText(profile.email);
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    }
  };

  // URL Validator helper
  const isValidUrl = (urlString) => {
    if (!urlString || !urlString.trim()) return true;
    try {
      const url = new URL(urlString.trim());
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch (e) {
      return false;
    }
  };

  // Tag Input handlers
  const handleAddSkill = (skill) => {
    const trimmed = skill.trim();
    if (!trimmed) return;
    if (!formData.targetSkills.some(s => s.toLowerCase() === trimmed.toLowerCase())) {
      setFormData(prev => ({
        ...prev,
        targetSkills: [...prev.targetSkills, trimmed]
      }));
    }
    setSkillTagInput('');
  };

  const handleRemoveSkill = (skillToRemove) => {
    setFormData(prev => ({
      ...prev,
      targetSkills: prev.targetSkills.filter(s => s !== skillToRemove)
    }));
  };

  const handleSkillKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAddSkill(skillTagInput);
    } else if (e.key === 'Backspace' && !skillTagInput && formData.targetSkills.length > 0) {
      handleRemoveSkill(formData.targetSkills[formData.targetSkills.length - 1]);
    }
  };

  // Avatar file upload handler
  const handleAvatarFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('File size exceeds 2MB limit. Please select a smaller image.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          avatarUrl: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Form Validation
  const validateForm = () => {
    const errors = {};
    if (!formData.fullName || !formData.fullName.trim()) {
      errors.fullName = 'Full Name is required.';
    }
    if (formData.bio && formData.bio.length > 300) {
      errors.bio = 'Bio cannot exceed 300 characters.';
    }
    if (formData.socialLinks.github && !isValidUrl(formData.socialLinks.github)) {
      errors.github = 'Please enter a valid URL (e.g., https://github.com/username).';
    }
    if (formData.socialLinks.linkedin && !isValidUrl(formData.socialLinks.linkedin)) {
      errors.linkedin = 'Please enter a valid URL (e.g., https://linkedin.com/in/username).';
    }
    if (formData.socialLinks.portfolio && !isValidUrl(formData.socialLinks.portfolio)) {
      errors.portfolio = 'Please enter a valid URL (e.g., https://myportfolio.com).';
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit Profile Changes
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    setSaving(true);
    setSaveSuccess(false);

    try {
      const updated = await authService.updateProfile(formData);
      
      // Update local profile state
      setProfile(updated);
      populateFormData(updated);

      // Optimistic global state sync with AuthContext so Navbar and Dashboard reflect changes immediately
      if (updateUser) {
        updateUser({
          id: updated.id,
          fullName: updated.fullName,
          avatarUrl: updated.avatarUrl,
          email: updated.email,
          targetRole: updated.targetRole
        });
      }

      setSaveSuccess(true);
      setTimeout(() => {
        setIsEditing(false);
        setSaveSuccess(false);
      }, 1000);
    } catch (err) {
      console.error('Failed to update profile:', err);
      const errMsg = err.response?.data?.error || err.message || 'Failed to update profile details.';
      alert(errMsg);
    } finally {
      setSaving(false);
    }
  };

  // 1. Loading Skeleton
  if (loading) {
    return (
      <div className="space-y-6 max-w-6xl mx-auto animate-pulse font-sans">
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-8 flex flex-col md:flex-row items-center gap-6">
          <div className="w-28 h-28 rounded-2xl bg-slate-800 shrink-0"></div>
          <div className="space-y-3 flex-1 w-full text-center md:text-left">
            <div className="h-7 bg-slate-800 rounded w-1/3"></div>
            <div className="h-4 bg-slate-800/60 rounded w-1/4"></div>
            <div className="flex gap-2 justify-center md:justify-start">
              <div className="h-6 bg-slate-800 rounded w-24"></div>
              <div className="h-6 bg-slate-800 rounded w-32"></div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 h-80"></div>
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 h-80 md:col-span-2"></div>
        </div>
      </div>
    );
  }

  // 2. Error Fallback
  if (error) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-rose-800/60 rounded-3xl p-8 max-w-md w-full text-center space-y-4 shadow-2xl">
          <div className="w-14 h-14 bg-rose-500/10 text-rose-400 rounded-2xl flex items-center justify-center mx-auto border border-rose-500/20">
            <AlertCircle className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Profile Data Unavailable</h2>
            <p className="text-slate-400 text-xs mt-1 leading-relaxed">{error}</p>
          </div>
          <button
            onClick={loadProfileData}
            className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-rose-600/20 flex items-center justify-center gap-2 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" /> Retry Loading Profile
          </button>
        </div>
      </div>
    );
  }

  const stats = profile?.stats || {
    totalInterviews: 0,
    completedInterviews: 0,
    averageScore: 0,
    highestScore: 0,
    textInterviews: 0,
    voiceInterviews: 0,
    videoInterviews: 0
  };

  const gamification = profile?.gamification || {
    level: 1,
    xpPoints: 0,
    streakDays: 0
  };

  const targetSkills = profile?.targetSkills || [];
  const skillProficiencies = profile?.skillProficiencies || [];
  const recentInterviews = profile?.recentInterviews || [];
  const socialLinks = profile?.socialLinks || {};

  const experienceBadgeColor = {
    'Student': 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    'Entry-level': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    'Mid-level': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    'Senior': 'bg-purple-500/10 text-purple-400 border-purple-500/20'
  }[profile?.experienceLevel || 'Student'] || 'bg-slate-500/10 text-slate-400 border-slate-500/20';

  return (
    <div className="space-y-8 max-w-6xl mx-auto font-sans pb-12">
      {/* Top Breadcrumb & Action Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <span>Career Portfolio</span>
            <span>&bull;</span>
            <span className="text-blue-400 font-semibold">User Profile & Preparation Identity</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Profile & Career Readiness
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Active Placement Candidate</span>
          </div>

          <button
            id="edit-profile-button"
            onClick={() => {
              populateFormData(profile);
              setIsEditing(true);
            }}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-blue-600/20 flex items-center gap-2 cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5" /> Edit Profile
          </button>
        </div>
      </div>

      {/* Main 2-Column Profile View Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* =========================================
            LEFT COLUMN: Avatar Card & Identity Summary
            ========================================= */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-slate-900/90 border border-slate-800/80 rounded-3xl p-6 shadow-xl relative overflow-hidden backdrop-blur-sm">
            <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/5 rounded-full blur-2xl pointer-events-none"></div>

            <div className="flex flex-col items-center text-center relative z-10 space-y-4">
              {/* Avatar with Glow and Online Ring */}
              <div className="relative group">
                <div className="w-28 h-28 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-purple-600 p-1 shadow-2xl shadow-blue-500/20 overflow-hidden">
                  <img
                    src={profile?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(profile?.fullName || 'Student')}`}
                    alt={profile?.fullName || 'Avatar'}
                    className="w-full h-full rounded-xl bg-slate-950 object-cover"
                  />
                </div>
                <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-2 border-slate-950 rounded-full" title="Active"></span>
              </div>

              {/* Name & Title */}
              <div className="space-y-1">
                <h2 className="text-xl font-bold text-white tracking-tight">
                  {profile?.fullName || 'Candidate Name'}
                </h2>
                <p className="text-xs font-semibold text-blue-400">
                  {profile?.targetRole || 'Full Stack Developer'}
                </p>
                <div className="pt-1 flex items-center justify-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border uppercase tracking-wider ${experienceBadgeColor}`}>
                    {profile?.experienceLevel || 'Student'}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-800 text-slate-300 border border-slate-700">
                    LVL {gamification.level}
                  </span>
                </div>
              </div>

              {/* Bio / Elevator Pitch */}
              <div className="w-full bg-slate-950/60 border border-slate-800/70 rounded-2xl p-3.5 text-xs text-slate-300 text-left leading-relaxed">
                <p className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold mb-1 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-400" /> Career Pitch
                </p>
                <p className="italic">
                  "{profile?.bio || 'Passionate software engineer focused on building performant distributed systems and excelling in technical interviews.'}"
                </p>
              </div>

              {/* Contact Information Quick List */}
              <div className="w-full space-y-2 pt-2 border-t border-slate-800/80 text-xs text-left">
                <div className="flex items-center justify-between text-slate-300 p-2 rounded-xl bg-slate-950/40 border border-slate-800/50">
                  <div className="flex items-center gap-2 min-w-0">
                    <Mail className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span className="truncate text-[11px]">{profile?.email || 'N/A'}</span>
                  </div>
                  <button
                    onClick={handleCopyEmail}
                    className="text-slate-400 hover:text-white p-1 rounded transition-colors cursor-pointer"
                    title="Copy Email"
                  >
                    {copiedEmail ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>

                {profile?.phone && (
                  <div className="flex items-center gap-2 text-slate-300 p-2 rounded-xl bg-slate-950/40 border border-slate-800/50 text-[11px]">
                    <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{profile.phone}</span>
                  </div>
                )}
              </div>

              {/* Social / Portfolio Links Bar */}
              <div className="w-full pt-1">
                <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold mb-2 text-left">
                  Social & Portfolio Presence
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {/* GitHub */}
                  {socialLinks.github ? (
                    <a
                      href={socialLinks.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-all"
                    >
                      <GithubIcon className="w-3.5 h-3.5 text-slate-400" />
                      <span>GitHub</span>
                    </a>
                  ) : (
                    <div className="p-2 rounded-xl bg-slate-950/40 border border-slate-800/40 text-slate-600 text-[11px] flex items-center justify-center gap-1">
                      <GithubIcon className="w-3.5 h-3.5" />
                      <span>GitHub</span>
                    </div>
                  )}

                  {/* LinkedIn */}
                  {socialLinks.linkedin ? (
                    <a
                      href={socialLinks.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-all"
                    >
                      <LinkedinIcon className="w-3.5 h-3.5 text-blue-400" />
                      <span>LinkedIn</span>
                    </a>
                  ) : (
                    <div className="p-2 rounded-xl bg-slate-950/40 border border-slate-800/40 text-slate-600 text-[11px] flex items-center justify-center gap-1">
                      <LinkedinIcon className="w-3.5 h-3.5" />
                      <span>LinkedIn</span>
                    </div>
                  )}

                  {/* Portfolio */}
                  {socialLinks.portfolio ? (
                    <a
                      href={socialLinks.portfolio}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-all"
                    >
                      <Globe className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Website</span>
                    </a>
                  ) : (
                    <div className="p-2 rounded-xl bg-slate-950/40 border border-slate-800/40 text-slate-600 text-[11px] flex items-center justify-center gap-1">
                      <Globe className="w-3.5 h-3.5" />
                      <span>Website</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Edit Profile Button */}
              <button
                onClick={() => {
                  populateFormData(profile);
                  setIsEditing(true);
                }}
                className="w-full py-2.5 bg-slate-800/80 hover:bg-slate-700/80 text-white rounded-xl text-xs font-semibold border border-slate-700 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <Edit3 className="w-3.5 h-3.5 text-blue-400" /> Edit Complete Profile
              </button>
            </div>
          </div>

          {/* Academic Identity Card */}
          <div className="bg-slate-900/90 border border-slate-800/80 rounded-3xl p-5 shadow-xl space-y-3">
            <h3 className="text-xs font-bold text-white flex items-center gap-2 uppercase tracking-wider text-slate-400">
              <GraduationCap className="w-4 h-4 text-cyan-400" /> Academic Credentials
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex items-start gap-2 text-slate-300">
                <Building className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-white">{profile?.college || 'University Engineering Campus'}</p>
                  <p className="text-[11px] text-slate-400">{profile?.degree || 'B.Tech'} in {profile?.branch || 'Computer Science'}</p>
                </div>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-slate-800 text-[11px]">
                <span className="text-slate-400">Graduation Year:</span>
                <span className="font-bold text-white">{profile?.graduationYear || '2026'}</span>
              </div>
              {profile?.cgpa && (
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Cumulative CGPA:</span>
                  <span className="font-extrabold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    {profile.cgpa} / 10.0
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* =========================================
            RIGHT COLUMN: Tabbed Section Details
            ========================================= */}
        <div className="lg:col-span-8 space-y-6">

          {/* Modern Navigation Tabs */}
          <div className="flex items-center gap-2 p-1.5 bg-slate-900/90 border border-slate-800 rounded-2xl overflow-x-auto">
            <button
              onClick={() => setActiveTab('skills')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
                activeTab === 'skills'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Target className="w-3.5 h-3.5" /> Target Roles & Skills
            </button>

            <button
              onClick={() => setActiveTab('personal')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
                activeTab === 'personal'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <User className="w-3.5 h-3.5" /> Personal Information
            </button>

            <button
              onClick={() => setActiveTab('social')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
                activeTab === 'social'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Globe className="w-3.5 h-3.5" /> Social & Portfolios
            </button>

            <button
              onClick={() => setActiveTab('performance')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
                activeTab === 'performance'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Award className="w-3.5 h-3.5" /> Performance Summary
            </button>
          </div>

          {/* TAB 1: TARGET ROLES & SKILLS */}
          {activeTab === 'skills' && (
            <div className="space-y-6">
              {/* Target Role & Level Overview Card */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                  <div>
                    <h3 className="font-bold text-white text-base flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-blue-400" /> Desired Career Trajectory
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">Role target configured for mock interview personalization</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-extrabold border uppercase tracking-wider self-start sm:self-auto ${experienceBadgeColor}`}>
                    {profile?.experienceLevel || 'Student'} Level
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Target Role</span>
                    <p className="text-lg font-black text-white mt-1">{profile?.targetRole || 'Full Stack Developer'}</p>
                    <p className="text-[11px] text-blue-400 mt-1">AI Mock questions align to this specialty</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Target Stack Count</span>
                    <p className="text-lg font-black text-white mt-1">{targetSkills.length} Core Technologies</p>
                    <p className="text-[11px] text-emerald-400 mt-1">Tracked on performance radar</p>
                  </div>
                </div>
              </div>

              {/* Target Skills Chips Cloud */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <h3 className="font-bold text-white text-sm flex items-center gap-2">
                      <Code2 className="w-4 h-4 text-cyan-400" /> Target Skills & Technologies
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">Focus areas prioritized in text, voice, and video evaluation</p>
                  </div>
                  <button
                    onClick={() => {
                      populateFormData(profile);
                      setIsEditing(true);
                    }}
                    className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1"
                  >
                    Manage Skills <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                {targetSkills.length === 0 ? (
                  <div className="p-6 text-center text-slate-400 text-xs">
                    No target skills added yet. Click "Edit Profile" to add technologies.
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2.5">
                    {targetSkills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-blue-500/50 text-slate-200 text-xs font-semibold shadow-sm transition-all"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Skill Proficiency Breakdown */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <h3 className="font-bold text-white text-sm flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-emerald-400" /> Skill Proficiency Benchmarks
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">Live assessment scores calculated from interview evaluations</p>
                  </div>
                  <Link
                    to="/practice/weak-areas"
                    className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1"
                  >
                    Skill Drills <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {skillProficiencies.length === 0 ? (
                    <div className="col-span-2 p-6 text-center text-slate-400 text-xs">
                      Take mock interviews to generate skill accuracy metrics.
                    </div>
                  ) : (
                    skillProficiencies.map((item, idx) => (
                      <div key={idx} className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-2">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-bold text-white">{item.name}</span>
                          <span className={`font-black ${item.score >= 70 ? 'text-emerald-400' : item.score >= 50 ? 'text-blue-400' : 'text-amber-400'}`}>
                            {item.score}%
                          </span>
                        </div>
                        <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
                          <div
                            className={`h-full rounded-full transition-all duration-700 ${
                              item.score >= 70
                                ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                                : item.score >= 50
                                ? 'bg-gradient-to-r from-blue-500 to-indigo-500'
                                : 'bg-gradient-to-r from-amber-500 to-orange-400'
                            }`}
                            style={{ width: `${Math.min(100, Math.max(0, item.score || 0))}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between text-[10px] text-slate-500">
                          <span>{item.category || 'TECHNICAL'}</span>
                          <span>{item.score >= 70 ? 'Proficient' : item.score >= 50 ? 'Intermediate' : 'Needs Practice'}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PERSONAL INFORMATION & ACADEMICS */}
          {activeTab === 'personal' && (
            <div className="space-y-6">
              <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
                <div className="border-b border-slate-800 pb-3">
                  <h3 className="font-bold text-white text-base flex items-center gap-2">
                    <User className="w-4 h-4 text-blue-400" /> Candidate Personal Profile
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">Primary account and contact information</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-1">
                    <span className="text-[11px] text-slate-500 uppercase font-semibold">Full Legal Name</span>
                    <p className="text-sm font-bold text-white">{profile?.fullName || 'N/A'}</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-slate-500 uppercase font-semibold">Email Address</span>
                      <span className="inline-flex items-center gap-1 text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 font-semibold">
                        <Lock className="w-2.5 h-2.5" /> Read-Only
                      </span>
                    </div>
                    <p className="text-sm font-bold text-white">{profile?.email || 'N/A'}</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-1">
                    <span className="text-[11px] text-slate-500 uppercase font-semibold">Contact Phone</span>
                    <p className="text-sm font-bold text-white">{profile?.phone || 'Not specified'}</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-1">
                    <span className="text-[11px] text-slate-500 uppercase font-semibold">Account Role</span>
                    <p className="text-sm font-bold text-cyan-400 uppercase tracking-wide">
                      {profile?.role?.replace('ROLE_', '') || 'STUDENT'}
                    </p>
                  </div>
                </div>

                <div className="pt-2">
                  <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-1.5">
                    <span className="text-[11px] text-slate-500 uppercase font-semibold">Professional Bio & Career Objective</span>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {profile?.bio || 'No candidate bio provided yet.'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
                <div className="border-b border-slate-800 pb-3">
                  <h3 className="font-bold text-white text-base flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-cyan-400" /> College & Education Details
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">Academic background used for campus recruitment eligibility</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-1 sm:col-span-2">
                    <span className="text-[11px] text-slate-500 uppercase font-semibold">College / University Name</span>
                    <p className="text-sm font-bold text-white">{profile?.college || 'University Engineering Campus'}</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-1">
                    <span className="text-[11px] text-slate-500 uppercase font-semibold">Degree Program</span>
                    <p className="text-sm font-bold text-white">{profile?.degree || 'B.Tech'}</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-1">
                    <span className="text-[11px] text-slate-500 uppercase font-semibold">Department / Branch</span>
                    <p className="text-sm font-bold text-white">{profile?.branch || 'Computer Science'}</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-1">
                    <span className="text-[11px] text-slate-500 uppercase font-semibold">Graduation Batch</span>
                    <p className="text-sm font-bold text-white">Class of {profile?.graduationYear || '2026'}</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-1">
                    <span className="text-[11px] text-slate-500 uppercase font-semibold">Academic CGPA</span>
                    <p className="text-sm font-bold text-emerald-400">{profile?.cgpa ? `${profile.cgpa} / 10.0` : 'Not provided'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SOCIAL & PORTFOLIO LINKS */}
          {activeTab === 'social' && (
            <div className="space-y-6">
              <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
                <div className="border-b border-slate-800 pb-3 flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-white text-base flex items-center gap-2">
                      <Globe className="w-4 h-4 text-cyan-400" /> Connected Social & Portfolio Links
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">Online portfolios shared during recruiter evaluations</p>
                  </div>
                  <button
                    onClick={() => {
                      populateFormData(profile);
                      setIsEditing(true);
                    }}
                    className="text-xs text-blue-400 hover:text-blue-300 font-semibold"
                  >
                    Edit Links
                  </button>
                </div>

                <div className="space-y-4">
                  {/* GitHub Card */}
                  <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-700/80 flex items-center justify-center text-white shrink-0">
                        <GithubIcon className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-white text-xs">GitHub Repository</p>
                        <p className="text-[11px] text-slate-400 truncate">
                          {socialLinks.github || 'No GitHub link added'}
                        </p>
                      </div>
                    </div>
                    {socialLinks.github ? (
                      <a
                        href={socialLinks.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-semibold border border-slate-700 transition-all flex items-center gap-1.5 shrink-0"
                      >
                        Visit Profile <ExternalLink className="w-3 h-3 text-blue-400" />
                      </a>
                    ) : (
                      <button
                        onClick={() => {
                          populateFormData(profile);
                          setIsEditing(true);
                        }}
                        className="px-3 py-1.5 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-500/20 rounded-xl text-xs font-semibold transition-all shrink-0"
                      >
                        + Add URL
                      </button>
                    )}
                  </div>

                  {/* LinkedIn Card */}
                  <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-blue-600/10 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
                        <LinkedinIcon className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-white text-xs">LinkedIn Profile</p>
                        <p className="text-[11px] text-slate-400 truncate">
                          {socialLinks.linkedin || 'No LinkedIn link added'}
                        </p>
                      </div>
                    </div>
                    {socialLinks.linkedin ? (
                      <a
                        href={socialLinks.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-semibold border border-slate-700 transition-all flex items-center gap-1.5 shrink-0"
                      >
                        Visit Profile <ExternalLink className="w-3 h-3 text-blue-400" />
                      </a>
                    ) : (
                      <button
                        onClick={() => {
                          populateFormData(profile);
                          setIsEditing(true);
                        }}
                        className="px-3 py-1.5 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-500/20 rounded-xl text-xs font-semibold transition-all shrink-0"
                      >
                        + Add URL
                      </button>
                    )}
                  </div>

                  {/* Portfolio Website Card */}
                  <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-cyan-600/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
                        <Globe className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-white text-xs">Personal Portfolio / Website</p>
                        <p className="text-[11px] text-slate-400 truncate">
                          {socialLinks.portfolio || 'No portfolio website link added'}
                        </p>
                      </div>
                    </div>
                    {socialLinks.portfolio ? (
                      <a
                        href={socialLinks.portfolio}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-semibold border border-slate-700 transition-all flex items-center gap-1.5 shrink-0"
                      >
                        Open Website <ExternalLink className="w-3 h-3 text-blue-400" />
                      </a>
                    ) : (
                      <button
                        onClick={() => {
                          populateFormData(profile);
                          setIsEditing(true);
                        }}
                        className="px-3 py-1.5 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-500/20 rounded-xl text-xs font-semibold transition-all shrink-0"
                      >
                        + Add URL
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: INTERVIEW PERFORMANCE SUMMARY (Read-Only Aggregate Metrics) */}
          {activeTab === 'performance' && (
            <div className="space-y-6">
              {/* Quick Aggregate Metric Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-lg">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Completed</span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-2xl font-black text-white">{stats.completedInterviews}</span>
                    <span className="text-xs text-slate-500">/ {stats.totalInterviews} taken</span>
                  </div>
                </div>

                <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-lg">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Average Accuracy</span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className={`text-2xl font-black ${stats.averageScore >= 80 ? 'text-emerald-400' : stats.averageScore >= 50 ? 'text-blue-400' : 'text-amber-400'}`}>
                      {stats.averageScore}%
                    </span>
                    <span className="text-xs text-slate-500">benchmark</span>
                  </div>
                </div>

                <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-lg">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Highest Peak</span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-2xl font-black text-purple-400">{stats.highestScore}%</span>
                    <span className="text-xs text-slate-500">personal best</span>
                  </div>
                </div>

                <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-lg">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Prep Streak</span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-2xl font-black text-amber-400">{gamification.streakDays}</span>
                    <span className="text-xs text-slate-500">active days</span>
                  </div>
                </div>
              </div>

              {/* Mode Breakdown */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
                <div className="border-b border-slate-800 pb-3">
                  <h3 className="font-bold text-white text-sm flex items-center gap-2">
                    <Layers className="w-4 h-4 text-blue-400" /> Interview Format Distribution
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">Aggregate completed practice across evaluation formats</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-[11px] uppercase font-semibold">Text Interviews</p>
                      <p className="text-xl font-black text-white mt-0.5">{stats.textInterviews}</p>
                    </div>
                    <span className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 font-bold">TEXT</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-[11px] uppercase font-semibold">Voice Interviews</p>
                      <p className="text-xl font-black text-white mt-0.5">{stats.voiceInterviews}</p>
                    </div>
                    <span className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 font-bold">VOICE</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-[11px] uppercase font-semibold">Video Interviews</p>
                      <p className="text-xl font-black text-white mt-0.5">{stats.videoInterviews}</p>
                    </div>
                    <span className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-bold">VIDEO</span>
                  </div>
                </div>
              </div>

              {/* Recent Interview Sessions List */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <h3 className="font-bold text-white text-sm flex items-center gap-2">
                      <Clock className="w-4 h-4 text-blue-400" /> Recent Mock Interview Performance Logs
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">Read-only historical evaluation reports</p>
                  </div>
                  <Link to="/interview/history" className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1">
                    View Full History <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>

                {recentInterviews.length === 0 ? (
                  <div className="py-8 text-center text-slate-400 text-xs space-y-2">
                    <p>No interview sessions recorded yet.</p>
                    <Link
                      to="/interview/setup"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold"
                    >
                      <PlayCircle className="w-3.5 h-3.5" /> Start Practice Interview
                    </Link>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                        <tr>
                          <th className="p-3 font-semibold">Role & Target Company</th>
                          <th className="p-3 font-semibold">Mode</th>
                          <th className="p-3 font-semibold">Score</th>
                          <th className="p-3 font-semibold">Date</th>
                          <th className="p-3 font-semibold text-right">Report</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {recentInterviews.map((item) => (
                          <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                            <td className="p-3">
                              <span className="font-semibold text-white block">{item.role}</span>
                              <span className="text-[11px] text-slate-400 block">{item.company}</span>
                            </td>
                            <td className="p-3">
                              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                                {item.mode}
                              </span>
                            </td>
                            <td className="p-3">
                              <span className={`font-bold text-xs ${item.score >= 80 ? 'text-emerald-400' : item.score >= 50 ? 'text-blue-400' : 'text-amber-400'}`}>
                                {item.score}%
                              </span>
                            </td>
                            <td className="p-3 text-slate-400">{item.startedAt || 'Recent'}</td>
                            <td className="p-3 text-right">
                              <Link
                                to={`/interview/result/${item.id}`}
                                className="px-2.5 py-1 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-lg text-[11px] font-semibold transition-all inline-flex items-center gap-1"
                              >
                                View Report
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* =========================================
          PROFILE EDIT MODAL DIALOG
          ========================================= */}
      {isEditing && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl space-y-6 my-auto animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-extrabold text-white text-lg flex items-center gap-2">
                  <Edit3 className="w-5 h-5 text-blue-400" /> Edit Profile Details
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Update candidate information, target skills, bio, and portfolio links
                </p>
              </div>
              <button
                id="close-profile-modal"
                onClick={() => setIsEditing(false)}
                className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {saveSuccess && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                Profile updated successfully! Synchronizing across dashboard...
              </div>
            )}

            <form onSubmit={handleEditSubmit} className="space-y-6 text-xs max-h-[75vh] overflow-y-auto pr-1">
              
              {/* SECTION: AVATAR SELECTION & PREVIEW */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
                <label className="text-slate-300 block font-bold text-xs">
                  Avatar Picture & Preview
                </label>
                
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  {/* Live Avatar Preview */}
                  <div className="w-20 h-20 rounded-2xl bg-slate-900 border-2 border-blue-500/40 p-0.5 shadow-lg overflow-hidden shrink-0">
                    <img
                      src={formData.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(formData.fullName || 'Student')}`}
                      alt="Avatar Preview"
                      className="w-full h-full rounded-xl object-cover"
                    />
                  </div>

                  <div className="flex-1 w-full space-y-3">
                    {/* Preset Avatars */}
                    <div>
                      <span className="text-[11px] text-slate-400 block mb-1.5 font-medium">Choose a preset avatar:</span>
                      <div className="flex flex-wrap gap-2">
                        {PRESET_AVATARS.map((av) => (
                          <button
                            key={av.id}
                            type="button"
                            onClick={() => setFormData({ ...formData, avatarUrl: av.url })}
                            className={`w-9 h-9 rounded-xl border p-0.5 transition-all overflow-hidden cursor-pointer ${
                              formData.avatarUrl === av.url ? 'border-blue-500 ring-2 ring-blue-500/30' : 'border-slate-800 hover:border-slate-700'
                            }`}
                            title={av.name}
                          >
                            <img src={av.url} alt={av.name} className="w-full h-full rounded-lg object-cover" />
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Or Upload Custom Image / Enter URL */}
                    <div className="flex flex-col sm:flex-row items-center gap-2">
                      <div className="relative flex-1 w-full">
                        <input
                          type="url"
                          placeholder="Or enter custom image URL"
                          value={formData.avatarUrl}
                          onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      <label className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-semibold border border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer shrink-0">
                        <Upload className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Upload Local</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleAvatarFileUpload}
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION: BASIC INFORMATION */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider">
                  Basic Details
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-300 block font-semibold mb-1">
                      Full Legal Name <span className="text-rose-400">*</span>
                    </label>
                    <input
                      id="edit-fullName"
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => {
                        setFormData({ ...formData, fullName: e.target.value });
                        if (validationErrors.fullName) setValidationErrors({ ...validationErrors, fullName: null });
                      }}
                      required
                      placeholder="e.g. Alex Morgan"
                      className={`w-full bg-slate-950 border rounded-xl px-3.5 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 ${
                        validationErrors.fullName ? 'border-rose-500' : 'border-slate-800'
                      }`}
                    />
                    {validationErrors.fullName && (
                      <p className="text-[11px] text-rose-400 mt-1">{validationErrors.fullName}</p>
                    )}
                  </div>

                  <div>
                    <label className="text-slate-300 block font-semibold mb-1 flex items-center justify-between">
                      <span>Email Address</span>
                      <span className="text-[10px] text-amber-400 font-normal flex items-center gap-0.5">
                        <Lock className="w-2.5 h-2.5" /> Read-Only
                      </span>
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      disabled
                      className="w-full bg-slate-950/50 border border-slate-800/60 rounded-xl px-3.5 py-2 text-slate-500 cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-300 block font-semibold mb-1">Phone Number</label>
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+1 (555) 0199"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="text-slate-300 block font-semibold mb-1">Experience Level</label>
                    <select
                      value={formData.experienceLevel}
                      onChange={(e) => setFormData({ ...formData, experienceLevel: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="Student">Student (Pre-final / Final Year)</option>
                      <option value="Entry-level">Entry-level (0-2 Years)</option>
                      <option value="Mid-level">Mid-level (2-5 Years)</option>
                      <option value="Senior">Senior (5+ Years)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-slate-300 block font-semibold mb-1">
                    Target Role
                  </label>
                  <input
                    id="edit-targetRole"
                    type="text"
                    value={formData.targetRole}
                    onChange={(e) => setFormData({ ...formData, targetRole: e.target.value })}
                    placeholder="e.g. Full Stack Developer, Data Scientist, Cloud Architect"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* SECTION: TARGET SKILLS WITH TAG INPUT */}
              <div className="space-y-3 p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
                <div className="flex justify-between items-center">
                  <label className="text-slate-300 block font-bold text-xs">
                    Target Skills (Tag Input)
                  </label>
                  <span className="text-[11px] text-blue-400 font-semibold">
                    {formData.targetSkills.length} selected
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Type a technology or skill and press <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-white font-mono text-[10px]">Enter</kbd> or <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-white font-mono text-[10px]">,</kbd> to add.
                </p>

                {/* Tags Container */}
                <div className="min-h-[46px] p-2 bg-slate-900 border border-slate-800 rounded-xl flex flex-wrap gap-2 items-center">
                  {formData.targetSkills.map((skill, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-600/20 text-blue-300 border border-blue-500/30 text-xs font-semibold animate-in fade-in"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill)}
                        className="text-blue-400 hover:text-white transition-colors cursor-pointer"
                        title="Remove skill"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}

                  <input
                    id="skill-tag-input"
                    type="text"
                    value={skillTagInput}
                    onChange={(e) => setSkillTagInput(e.target.value)}
                    onKeyDown={handleSkillKeyDown}
                    placeholder={formData.targetSkills.length === 0 ? "e.g. React, Python..." : "Add skill..."}
                    className="flex-1 min-w-[120px] bg-transparent text-white placeholder-slate-500 text-xs focus:outline-none"
                  />
                </div>

                {/* Popular Skill Suggestions */}
                <div className="pt-1">
                  <span className="text-[11px] text-slate-500 block mb-1">Quick add suggestions:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {SUGGESTED_SKILLS.map((s) => {
                      const isAdded = formData.targetSkills.some(item => item.toLowerCase() === s.toLowerCase());
                      return (
                        <button
                          key={s}
                          type="button"
                          disabled={isAdded}
                          onClick={() => handleAddSkill(s)}
                          className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold border transition-all ${
                            isAdded
                              ? 'bg-slate-900 text-slate-600 border-slate-800 cursor-not-allowed'
                              : 'bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border-slate-800 cursor-pointer'
                          }`}
                        >
                          + {s}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* SECTION: BIO / SUMMARY WITH CHARACTER COUNTER */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-slate-300 block font-semibold">
                    Professional Bio / Summary
                  </label>
                  <span className={`text-[11px] font-mono ${
                    (formData.bio?.length || 0) > 300
                      ? 'text-rose-400 font-bold'
                      : (formData.bio?.length || 0) > 260
                      ? 'text-amber-400'
                      : 'text-slate-500'
                  }`}>
                    {formData.bio?.length || 0} / 300
                  </span>
                </div>
                <textarea
                  id="edit-bio"
                  rows={3}
                  maxLength={300}
                  value={formData.bio}
                  onChange={(e) => {
                    setFormData({ ...formData, bio: e.target.value });
                    if (validationErrors.bio) setValidationErrors({ ...validationErrors, bio: null });
                  }}
                  placeholder="Tell recruiters about your background, strengths, and career aspirations..."
                  className={`w-full bg-slate-950 border rounded-xl p-3 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 ${
                    validationErrors.bio ? 'border-rose-500' : 'border-slate-800'
                  }`}
                />
                {validationErrors.bio && (
                  <p className="text-[11px] text-rose-400">{validationErrors.bio}</p>
                )}
              </div>

              {/* SECTION: SOCIAL & PORTFOLIO LINKS */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider">
                  Social & Portfolio Links
                </h4>

                <div className="space-y-2.5">
                  {/* GitHub URL */}
                  <div>
                    <label className="text-slate-300 block font-semibold mb-1 flex items-center gap-1.5">
                      <GithubIcon className="w-3.5 h-3.5 text-slate-400" /> GitHub Profile URL
                    </label>
                    <input
                      type="url"
                      value={formData.socialLinks.github}
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          socialLinks: { ...formData.socialLinks, github: e.target.value }
                        });
                        if (validationErrors.github) setValidationErrors({ ...validationErrors, github: null });
                      }}
                      placeholder="https://github.com/username"
                      className={`w-full bg-slate-950 border rounded-xl px-3.5 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 ${
                        validationErrors.github ? 'border-rose-500' : 'border-slate-800'
                      }`}
                    />
                    {validationErrors.github && (
                      <p className="text-[11px] text-rose-400 mt-1">{validationErrors.github}</p>
                    )}
                  </div>

                  {/* LinkedIn URL */}
                  <div>
                    <label className="text-slate-300 block font-semibold mb-1 flex items-center gap-1.5">
                      <LinkedinIcon className="w-3.5 h-3.5 text-blue-400" /> LinkedIn Profile URL
                    </label>
                    <input
                      type="url"
                      value={formData.socialLinks.linkedin}
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          socialLinks: { ...formData.socialLinks, linkedin: e.target.value }
                        });
                        if (validationErrors.linkedin) setValidationErrors({ ...validationErrors, linkedin: null });
                      }}
                      placeholder="https://linkedin.com/in/username"
                      className={`w-full bg-slate-950 border rounded-xl px-3.5 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 ${
                        validationErrors.linkedin ? 'border-rose-500' : 'border-slate-800'
                      }`}
                    />
                    {validationErrors.linkedin && (
                      <p className="text-[11px] text-rose-400 mt-1">{validationErrors.linkedin}</p>
                    )}
                  </div>

                  {/* Portfolio Website URL */}
                  <div>
                    <label className="text-slate-300 block font-semibold mb-1 flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-cyan-400" /> Portfolio Website
                    </label>
                    <input
                      type="url"
                      value={formData.socialLinks.portfolio}
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          socialLinks: { ...formData.socialLinks, portfolio: e.target.value }
                        });
                        if (validationErrors.portfolio) setValidationErrors({ ...validationErrors, portfolio: null });
                      }}
                      placeholder="https://myportfolio.dev"
                      className={`w-full bg-slate-950 border rounded-xl px-3.5 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 ${
                        validationErrors.portfolio ? 'border-rose-500' : 'border-slate-800'
                      }`}
                    />
                    {validationErrors.portfolio && (
                      <p className="text-[11px] text-rose-400 mt-1">{validationErrors.portfolio}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* SECTION: ACADEMIC DETAILS */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider">
                  Academic Background
                </h4>

                <div>
                  <label className="text-slate-300 block font-semibold mb-1">College / University</label>
                  <input
                    type="text"
                    value={formData.college}
                    onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                    placeholder="e.g. Silicon Valley Institute of Technology"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-300 block font-semibold mb-1">Degree</label>
                    <input
                      type="text"
                      value={formData.degree}
                      onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                      placeholder="B.Tech"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-slate-300 block font-semibold mb-1">Branch / Major</label>
                    <input
                      type="text"
                      value={formData.branch}
                      onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                      placeholder="Computer Science"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-300 block font-semibold mb-1">Graduation Year</label>
                    <input
                      type="number"
                      value={formData.graduationYear}
                      onChange={(e) => setFormData({ ...formData, graduationYear: e.target.value })}
                      placeholder="2026"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-slate-300 block font-semibold mb-1">CGPA (Out of 10.0)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.cgpa}
                      onChange={(e) => setFormData({ ...formData, cgpa: e.target.value })}
                      placeholder="9.25"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Form Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800 sticky bottom-0 bg-slate-900 py-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  id="submit-profile-changes"
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-600/25 flex items-center gap-2 cursor-pointer"
                >
                  {saving ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" /> Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProfilePage;
