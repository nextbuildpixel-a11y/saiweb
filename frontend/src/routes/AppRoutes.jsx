import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '../pages/public/LoginPage';
import RegisterPage from '../pages/public/RegisterPage';
import AdminLoginPage from '../pages/public/AdminLoginPage';
import DashboardPage from '../pages/student/DashboardPage';
import ProfilePage from '../pages/student/ProfilePage';
import ResumePage from '../pages/student/ResumePage';
import ResumeAnalysisPage from '../pages/student/ResumeAnalysisPage';
import JobDescriptionPage from '../pages/student/JobDescriptionPage';
import CompanyListPage from '../pages/student/CompanyListPage';
import CompanyDetailPage from '../pages/student/CompanyDetailPage';
import InterviewSetupPage from '../pages/student/InterviewSetupPage';
import TextInterviewPage from '../pages/student/TextInterviewPage';
import VoiceInterviewPage from '../pages/student/VoiceInterviewPage';
import VideoInterviewPage from '../pages/student/VideoInterviewPage';
import InterviewResultPage from '../pages/student/InterviewResultPage';
import AptitudePracticePage from '../pages/student/AptitudePracticePage';
import CodingPracticePage from '../pages/student/CodingPracticePage';
import BehavioralStarPage from '../pages/student/BehavioralStarPage';
import MockPlacementDrivePage from '../pages/student/MockPlacementDrivePage';
import SkillAnalyticsPage from '../pages/student/SkillAnalyticsPage';
import InterviewHistoryPage from '../pages/student/InterviewHistoryPage';
import WeakAreaPracticePage from '../pages/student/WeakAreaPracticePage';
import ImprovementPlanPage from '../pages/student/ImprovementPlanPage';
import GamificationPage from '../pages/student/GamificationPage';
import AdminDashboardPage from '../pages/admin/AdminDashboardPage';
import AdminCompanyManagementPage from '../pages/admin/AdminCompanyManagementPage';
import AdminAnalyticsPage from '../pages/admin/AdminAnalyticsPage';
import StudentLayout from '../components/layout/StudentLayout';
import AdminLayout from '../components/layout/AdminLayout';
import ProtectedRoute from '../components/common/ProtectedRoute';
import { useAuth } from '../context/AuthContext';

function RootRedirect() {
  const { isAuthenticated, role } = useAuth();
  if (isAuthenticated) {
    if (role === 'ROLE_ADMIN') return <Navigate to="/admin/dashboard" replace />;
    return <Navigate to="/dashboard" replace />;
  }
  return <LoginPage />;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public Landing -> Directly opens Login Page */}
      <Route path="/" element={<RootRedirect />} />

      {/* Public Authentication Pages */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/admin/login" element={<AdminLoginPage />} />

      {/* Protected Student Portal Routes */}
      <Route
        element={
          <ProtectedRoute requiredRole="ROLE_USER">
            <StudentLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/resume" element={<ResumePage />} />
        <Route path="/resume-analysis" element={<ResumeAnalysisPage />} />
        <Route path="/job-description" element={<JobDescriptionPage />} />
        <Route path="/companies" element={<CompanyListPage />} />
        <Route path="/companies/:id" element={<CompanyDetailPage />} />
        <Route path="/interview/setup" element={<InterviewSetupPage />} />
        <Route path="/interview/text/:id" element={<TextInterviewPage />} />
        <Route path="/interview/voice/:id" element={<VoiceInterviewPage />} />
        <Route path="/interview/video/:id" element={<VideoInterviewPage />} />
        <Route path="/interview/result/:id" element={<InterviewResultPage />} />
        <Route path="/interview/history" element={<InterviewHistoryPage />} />
        <Route path="/aptitude" element={<AptitudePracticePage />} />
        <Route path="/coding" element={<CodingPracticePage />} />
        <Route path="/dsa" element={<CodingPracticePage />} />
        <Route path="/skills" element={<SkillAnalyticsPage />} />
        <Route path="/practice/weak-areas" element={<WeakAreaPracticePage />} />
        <Route path="/behavioral-practice" element={<BehavioralStarPage />} />
        <Route path="/mock-placement" element={<MockPlacementDrivePage />} />
        <Route path="/improvement-plan" element={<ImprovementPlanPage />} />
        <Route path="/gamification" element={<GamificationPage />} />
      </Route>

      {/* Protected Admin Portal Routes */}
      <Route
        element={
          <ProtectedRoute requiredRole="ROLE_ADMIN">
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
        <Route path="/admin/users" element={<AdminDashboardPage />} />
        <Route path="/admin/companies" element={<AdminCompanyManagementPage />} />
        <Route path="/admin/roles" element={<AdminCompanyManagementPage />} />
        <Route path="/admin/company-roles" element={<AdminCompanyManagementPage />} />
        <Route path="/admin/skills" element={<AdminDashboardPage />} />
        <Route path="/admin/questions" element={<AdminDashboardPage />} />
        <Route path="/admin/coding" element={<AdminDashboardPage />} />
        <Route path="/admin/analytics" element={<AdminAnalyticsPage />} />
      </Route>

      {/* Fallback redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default AppRoutes;
