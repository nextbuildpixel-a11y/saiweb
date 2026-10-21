# AI Mock Interview & Placement Preparation Platform ("AI Interview Coach")

> **A State-of-the-Art, Full-Stack AI-Powered Campus Placement & Technical Mock Interview Preparation System** built with **Java 17**, **Spring Boot 3.2**, **MySQL**, **React (Vite)**, **Tailwind CSS**, and **Lucide Icons**.

---

## 🌟 Executive Overview

**AI Interview Coach** is an enterprise-grade, end-to-end platform engineered to prepare students for real-world campus recruitment drives and technical hiring pipelines. It provides an intelligent, adaptive interview simulation environment featuring **Text**, **Voice**, and **Video** interview modes, **Resume ATS Analysis**, **Job Description Matching**, **5-Round Mock Placement Drives**, **Dynamic Weak-Area Diagnostics**, **Visual Analytics**, and an **XP/Badges Gamification System**.

---

## 🚀 Key Features Matrix (Phases 1–17 Completed & Verified)

| Module | Core Functionality & Highlights |
| :--- | :--- |
| **Phase 1 — Project Setup** | Spring Boot 3.2 REST API + React Vite SPA architecture. |
| **Phase 2 — Auth & Security** | JWT Stateless Authentication, BCrypt Password Hashing, Role-Based Access Control (`ROLE_USER` & `ROLE_ADMIN`). |
| **Phase 3 — Database Entities** | 27 Relational MySQL JPA Hibernate Entities (`users`, `interviews`, `resumes`, `company_roles`, `mock_placement_drives`, `gamification_progress`, `xp_transactions`, etc.). |
| **Phase 4 — Dashboards & Nav** | Responsive Dark-Theme Student & Admin Control Centers with Recharts analytics cards. |
| **Phase 5 — Resume Upload & ATS** | PDF/DOCX Resume parsing via Apache PDFBox/POI, ATS score calculation, missing keywords, strengths & weaknesses breakdown. |
| **Phase 6 — Job Description Match** | JD text extraction, technical requirements parsing, and candidate resume vs. JD skill gap matrix comparison. |
| **Phase 7 — Company & Role Catalog** | Company catalog with public preparation info disclaimers and admin CRUD controls. |
| **Phase 8 — Central AI Engine** | Centralized Spring Boot `AIService`, `LLMClient`, `PromptTemplates`, `AIResponseValidator`, and `AIExceptionHandler`. |
| **Phase 9 — Text Interview Workspace** | Setup configuration, question generation, timer, real-time AI evaluation, and detailed score breakdown reports. |
| **Phase 10 — Voice Interview Workspace** | Web Speech API integration with Text-to-Speech (TTS) question playback and Speech-to-Text (STT) live transcription. |
| **Phase 11 — Video Interview Workspace** | WebRTC `getUserMedia()` camera preview, `MediaRecorder` video/audio recording, UUID file storage outside MySQL in `./uploads/videos/`. |
| **Phase 12 — Adaptive Question Engine** | Token Jaccard text similarity filter (>0.65 rejection), dynamic EASY/MEDIUM/HARD difficulty scaling based on candidate performance. |
| **Phase 13 — Placement Preparation** | Quantitative & Logical Aptitude MCQs, Java Algorithmic Problem Workspace, and STAR Framework HR Behavioral Evaluator. |
| **Phase 14 — Mock Placement Drive** | 5-Round Campus Drive Simulator: Round 1 (Aptitude) -> Round 2 (Technical MCQ) -> Round 3 (Coding) -> Round 4 (Tech Interview) -> Round 5 (HR STAR) -> Placement Readiness Verdict. |
| **Phase 15 — Analytics & Reports** | Student Skill Radar, Progression Trend line chart, Mode breakdown, Target Company Readiness index, and Admin System Governance Analytics. |
| **Phase 16 — Personalization Engine** | Automated Weak-Area Detection, 7-Day / 15-Day / 30-Day customized placement roadmaps, and daily practice queue. |
| **Phase 17 — Gamification & Rewards** | Motivation XP points, level progression (Level 1: Beginner to Level 5: Placement Ready), unlocked achievement badges, and XP audit logs. |

---

## 🛠 Technology Stack

### Backend
- **Language**: Java 17 LTS
- **Framework**: Spring Boot 3.2.3
- **Security**: Spring Security + JWT Stateless Filter + BCrypt Hashing
- **Persistence**: Spring Data JPA + Hibernate ORM
- **Database**: MySQL 8.0 / MySQL Enterprise
- **Document Processing**: Apache PDFBox 3.0 / Apache POI
- **Build Tool**: Apache Maven 3.9.6

### Frontend
- **Framework**: React 18 + Vite 8
- **Styling**: Tailwind CSS + Custom CSS Color Tokens
- **Icons**: Lucide React Icons
- **Data Visualization**: Recharts (Radar, Line, Bar, Pie charts)
- **Routing**: React Router DOM 6

---

## 🔒 Security & Data Isolation Audit

1. **User Ownership Protection**: All endpoints enforce strict user ownership validation. Students can only view their own resumes, interviews, answers, evaluations, skill data, and placement drive sessions.
2. **Role-Based Access Control**:
   - `ROLE_USER`: Access to Student Dashboard, Practice Workspaces, Resume ATS, Mock Interviews, Mock Placement Drives, Analytics, and Gamification.
   - `ROLE_ADMIN`: Access to Admin Control Center, User Accounts, Company Catalog, Job Role Skill Mappings, and System Governance Telemetry (`/api/admin/**`, `/api/analytics/admin/**`).
3. **API Key Security**: AI service keys are strictly encapsulated in Spring Boot backend environment variables (`OPENAI_API_KEY`, `GEMINI_API_KEY`) and are **never** exposed to the React client.
4. **File Upload Security**: Strict MIME type validation (`.pdf`, `.docx`, `.webm`, `.mp4`), size limits (<50MB for video), and secure UUID-based filenames saved outside MySQL in `./uploads/`.
5. **Code Execution Safety**: Algorithmic Java code evaluation is safely isolated in `PlacementPrepService` with string/syntax parsing and mock execution metrics without executing un-sandboxed shell code inside the main JVM.

---

## 💻 How to Run the Application

### 1. Database Setup
Create MySQL database `ai_interview_db`:
```sql
CREATE DATABASE IF NOT EXISTS ai_interview_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. Start Backend (Spring Boot on Port 8080)
```powershell
cd backend
..\tools\maven\apache-maven-3.9.6\bin\mvn.cmd spring-boot:run
```

### 3. Start Frontend (Vite React on Port 5173)
```powershell
cd frontend
npm run dev
```

### 4. Default Seeded Login Credentials

| Role | Email | Password | Access Rights |
| :--- | :--- | :--- | :--- |
| **Student** | `student@aiinterview.com` | `student123` | Full Student Portal (`/dashboard`, `/interview/setup`, `/mock-placement`, `/skills`, `/gamification`) |
| **Admin** | `admin@aiinterview.com` | `admin123` | Full Admin Portal (`/admin/dashboard`, `/admin/companies`, `/admin/analytics`) |

---

## 📄 License & Disclaimer

*This application provides simulated mock placement assessments and candidate preparation analytics. Standard public prep information disclaimers apply.*
