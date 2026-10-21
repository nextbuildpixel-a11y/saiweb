import React, { useState, useEffect } from 'react';
import { gamificationService } from '../../services/gamificationService';
import { Award, Flame, Zap, ShieldCheck, CheckCircle2, Star, Clock, Trophy, RefreshCw } from 'lucide-react';

function GamificationPage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const data = await gamificationService.getProfile();
      setProfile(data);
    } catch (err) {
      setError('Failed to fetch gamification profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-slate-400 text-xs gap-2 font-sans">
        <RefreshCw className="w-5 h-5 animate-spin text-amber-400" /> Computing XP Points & Achievement Badges...
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="bg-rose-950/60 border border-rose-800/80 rounded-xl p-4 text-rose-300 text-xs font-sans">
        {error || 'No gamification data available'}
      </div>
    );
  }

  const badgeIcons = {
    'FIRST_INTERVIEW': { name: 'First Interview', desc: 'Completed your 1st mock interview session' },
    '5_INTERVIEWS_COMPLETED': { name: '5 Interviews Master', desc: 'Completed 5 mock interview sessions' },
    '7_DAY_STREAK': { name: '7-Day Streak', desc: 'Maintained consecutive daily practice' },
    'DSA_BEGINNER': { name: 'DSA Beginner', desc: 'Solved your first algorithmic problem' }
  };

  return (
    <div className="space-y-8 font-sans max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/60 border border-slate-800/80 rounded-2xl p-6 shadow-xl space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 mb-1">
          <Trophy className="w-3.5 h-3.5" /> Gamification & Rewards Hub
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">XP Levels & Achievements</h1>
        <p className="text-slate-400 text-xs sm:text-sm">
          Earn XP points, unlock milestone badges, and maintain daily preparation streaks as you advance toward placement readiness.
        </p>
      </div>

      {/* Stats Hero Section */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Level Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">CURRENT LEVEL</span>
            <Award className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <span className="text-2xl font-extrabold text-white">Level {profile.level} &bull; {profile.levelTitle}</span>
            <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800 mt-2">
              <div className="bg-gradient-to-r from-amber-500 to-yellow-400 h-full rounded-full transition-all" style={{ width: `${profile.progressPct}%` }}></div>
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">{profile.xpPoints} / {profile.nextLevelXp} XP to Level {profile.level + 1}</span>
          </div>
        </div>

        {/* Total XP Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">TOTAL XP EARNED</span>
            <Zap className="w-5 h-5 text-yellow-400" />
          </div>
          <div>
            <span className="text-3xl font-extrabold text-amber-400">{profile.xpPoints} XP</span>
            <span className="text-xs text-slate-400 block mt-1">Motivation XP from completed activities</span>
          </div>
        </div>

        {/* Daily Streak Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">DAILY STREAK</span>
            <Flame className="w-5 h-5 text-orange-400 animate-pulse" />
          </div>
          <div>
            <span className="text-3xl font-extrabold text-orange-400">{profile.streakDays} Days</span>
            <span className="text-xs text-slate-400 block mt-1">Longest Streak: {profile.longestStreak} Days</span>
          </div>
        </div>
      </div>

      {/* Badges Showcase */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <h3 className="font-bold text-white text-sm flex items-center gap-2">
          <Star className="w-4 h-4 text-amber-400" /> Unlocked Achievement Badges ({profile.badges?.length || 0})
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          {profile.badges?.map((bKey, idx) => {
            const b = badgeIcons[bKey] || { name: bKey, desc: 'Achievement Milestone' };
            return (
              <div key={idx} className="bg-slate-950 p-4 rounded-xl border border-amber-500/30 text-center space-y-2">
                <div className="w-10 h-10 bg-amber-500/10 border border-amber-500/20 rounded-full flex items-center justify-center mx-auto text-amber-400 font-extrabold text-sm">
                  🏆
                </div>
                <div>
                  <span className="font-bold text-white text-xs block">{b.name}</span>
                  <span className="text-[10px] text-slate-400">{b.desc}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent XP Activity Timeline */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <h3 className="font-bold text-white text-sm flex items-center gap-2">
          <Clock className="w-4 h-4 text-blue-400" /> XP Audit Log & Recent Transactions
        </h3>
        <div className="space-y-2">
          {profile.recentTransactions?.map((tx, idx) => (
            <div key={idx} className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex justify-between items-center text-xs">
              <div className="space-y-0.5">
                <span className="font-bold text-white block">{tx.activity}</span>
                <span className="text-[10px] text-slate-500">{new Date(tx.date).toLocaleDateString()}</span>
              </div>
              <span className="font-extrabold text-amber-400 bg-amber-500/10 px-3 py-1 rounded-lg border border-amber-500/20">
                +{tx.xpEarned} XP
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default GamificationPage;
