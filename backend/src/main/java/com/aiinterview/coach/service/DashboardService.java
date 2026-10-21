package com.aiinterview.coach.service;

import com.aiinterview.coach.entity.*;
import com.aiinterview.coach.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class DashboardService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CompanyRepository companyRepository;

    @Autowired
    private JobRoleRepository jobRoleRepository;

    @Autowired
    private InterviewRepository interviewRepository;

    @Autowired
    private SkillScoreRepository skillScoreRepository;

    @Autowired
    private SkillGapRepository skillGapRepository;

    @Autowired
    private GamificationProgressRepository gamificationProgressRepository;

    @Autowired
    private TestAttemptRepository testAttemptRepository;

    public Map<String, Object> getStudentDashboard(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Student profile not found"));

        Map<String, Object> data = new HashMap<>();

        // Profile summary
        Map<String, Object> profile = new HashMap<>();
        profile.put("id", user.getId());
        profile.put("fullName", user.getFullName());
        profile.put("email", user.getEmail());
        profile.put("college", user.getCollege());
        profile.put("branch", user.getBranch());
        profile.put("graduationYear", user.getGraduationYear());
        profile.put("cgpa", user.getCgpa());
        data.put("profile", profile);

        // Fetch User's Real Mock Interviews
        List<Interview> userInterviews = interviewRepository.findByUserIdOrderByStartedAtDesc(user.getId());
        List<Map<String, Object>> recentInterviews = new ArrayList<>();
        int totalScoreSum = 0;
        int completedCount = 0;

        for (Interview inv : userInterviews) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", inv.getId());
            map.put("company", inv.getCompany() != null ? inv.getCompany().getName() : "General Practice");
            map.put("role", inv.getJobRole() != null ? inv.getJobRole().getTitle() : "Mock Interview");
            map.put("mode", inv.getMode() != null ? inv.getMode() : "Text");
            map.put("score", inv.getFinalScore() != null ? Math.round(inv.getFinalScore()) : 0);
            map.put("date", inv.getStartedAt() != null ? inv.getStartedAt().toLocalDate().toString() : "");
            map.put("status", inv.getStatus() != null ? inv.getStatus() : "IN_PROGRESS");
            recentInterviews.add(map);

            if ("COMPLETED".equals(inv.getStatus()) && inv.getFinalScore() != null) {
                totalScoreSum += inv.getFinalScore().intValue();
                completedCount++;
            }
        }
        data.put("recentInterviews", recentInterviews);

        // Compute Readiness score & status dynamically
        int placementReadiness = 0;
        String readinessStatus = "NEW_STUDENT";

        if (completedCount > 0) {
            placementReadiness = Math.min(100, Math.round((float) totalScoreSum / completedCount));
            if (placementReadiness >= 85) readinessStatus = "PLACEMENT_READY";
            else if (placementReadiness >= 70) readinessStatus = "READY_FOR_DRIVES";
            else if (placementReadiness >= 50) readinessStatus = "DEVELOPING";
            else readinessStatus = "NEEDS_PRACTICE";
        }
        data.put("placementReadiness", placementReadiness);
        data.put("readinessStatus", readinessStatus);

        // Skill Radar Chart Data
        List<SkillScore> userSkillScores = skillScoreRepository.findByUserId(user.getId());
        List<Map<String, Object>> skillRadar = new ArrayList<>();
        if (userSkillScores != null && !userSkillScores.isEmpty()) {
            for (SkillScore ss : userSkillScores) {
                skillRadar.add(Map.of(
                    "skill", ss.getSkill() != null ? ss.getSkill().getName() : "Skill",
                    "score", ss.getScore() != null ? Math.round(ss.getScore()) : 0,
                    "fullMark", 100
                ));
            }
        } else {
            // Initial baseline dimensions for new student
            skillRadar = Arrays.asList(
                Map.of("skill", "Java", "score", 0, "fullMark", 100),
                Map.of("skill", "SQL", "score", 0, "fullMark", 100),
                Map.of("skill", "DBMS", "score", 0, "fullMark", 100),
                Map.of("skill", "DSA", "score", 0, "fullMark", 100),
                Map.of("skill", "OOP", "score", 0, "fullMark", 100),
                Map.of("skill", "Communication", "score", 0, "fullMark", 100)
            );
        }
        data.put("skillRadar", skillRadar);

        // Performance Trend Chart Data
        List<Map<String, Object>> performanceTrend = new ArrayList<>();
        int mockIdx = 1;
        for (Interview inv : userInterviews) {
            if ("COMPLETED".equals(inv.getStatus()) && inv.getFinalScore() != null) {
                performanceTrend.add(Map.of(
                    "date", "Mock " + (mockIdx++),
                    "score", Math.round(inv.getFinalScore()),
                    "technical", Math.round(inv.getFinalScore()),
                    "communication", Math.round(inv.getFinalScore())
                ));
            }
        }
        data.put("performanceTrend", performanceTrend);

        // Weakest skill & Recommendation
        if (userSkillScores != null && !userSkillScores.isEmpty()) {
            SkillScore weakest = userSkillScores.stream()
                .filter(s -> s.getScore() != null)
                .min(Comparator.comparing(SkillScore::getScore))
                .orElse(null);
            if (weakest != null && weakest.getSkill() != null) {
                data.put("weakestSkill", weakest.getSkill().getName());
                data.put("recommendation", "Focus practice drills on " + weakest.getSkill().getName() + " to boost your placement score.");
            } else {
                data.put("weakestSkill", "Initial Assessment Pending");
                data.put("recommendation", "Take a mock interview to evaluate your skill profile.");
            }
        } else if (completedCount > 0) {
            data.put("weakestSkill", "General Technical & Aptitude");
            data.put("recommendation", "Complete topic-wise skill drills to establish your skill radar.");
        } else {
            data.put("weakestSkill", "Assessment Pending");
            data.put("recommendation", "Take your first mock interview to diagnose your strengths & weak areas.");
        }

        // Daily Practice Tasks
        List<Map<String, Object>> dailyTasks = Arrays.asList(
            Map.of("id", 1, "title", "Solve 2 Medium DSA Array Problems", "category", "CODING", "completed", false),
            Map.of("id", 2, "title", "Review Java 8 Streams & HashMap Internals", "category", "TECHNICAL", "completed", false),
            Map.of("id", 3, "title", "Attempt 10-Minute Quantitative Aptitude Drill", "category", "APTITUDE", "completed", false),
            Map.of("id", 4, "title", "Record 1 STAR Behavioral Voice Practice Response", "category", "VOICE", "completed", false)
        );
        data.put("dailyTasks", dailyTasks);

        // Quick Stats Bar Metrics
        int currentStreak = 0;
        int xp = 0;
        int level = 1;
        Optional<GamificationProgress> progress = gamificationProgressRepository.findByUserId(user.getId());
        if (progress.isPresent()) {
            xp = progress.get().getXpPoints() != null ? progress.get().getXpPoints() : 0;
            level = progress.get().getLevel() != null ? progress.get().getLevel() : 1;
            currentStreak = progress.get().getStreakDays() != null ? progress.get().getStreakDays() : 0;
        }
        data.put("xpPoints", xp);
        data.put("level", level);
        data.put("streakDays", currentStreak);
        data.put("currentStreak", currentStreak);

        // Completed Interviews & Average Score
        data.put("completedInterviews", completedCount);
        data.put("totalInterviews", userInterviews.size());
        int averageScore = completedCount > 0 ? Math.round((float) totalScoreSum / completedCount) : 0;
        data.put("averageScore", averageScore);

        // Aptitude Progress calculation
        List<TestAttempt> testAttempts = testAttemptRepository.findByUserId(user.getId());
        int aptitudeProgress = 0;
        if (testAttempts != null && !testAttempts.isEmpty()) {
            double totalObt = 0;
            double totalPossible = 0;
            for (TestAttempt ta : testAttempts) {
                if (ta.getScoreObtained() != null) {
                    totalObt += ta.getScoreObtained();
                    totalPossible += (ta.getTotalScore() != null && ta.getTotalScore() > 0) ? ta.getTotalScore() : 100.0;
                }
            }
            if (totalPossible > 0) {
                aptitudeProgress = (int) Math.min(100, Math.round((totalObt / totalPossible) * 100));
            }
        } else {
            // Check skill score for APTITUDE
            Optional<SkillScore> aptSkill = userSkillScores != null ? userSkillScores.stream()
                .filter(s -> s.getSkill() != null && "APTITUDE".equalsIgnoreCase(s.getSkill().getCategory()))
                .findFirst() : Optional.empty();
            if (aptSkill.isPresent() && aptSkill.get().getScore() != null) {
                aptitudeProgress = aptSkill.get().getScore().intValue();
            } else {
                aptitudeProgress = completedCount > 0 ? 50 : 25;
            }
        }
        data.put("aptitudeProgress", aptitudeProgress);

        return data;
    }

    public Map<String, Object> getAdminDashboard() {
        Map<String, Object> data = new HashMap<>();

        data.put("totalUsers", userRepository.count());
        data.put("activeCompanies", companyRepository.count());
        data.put("totalRoles", jobRoleRepository.count());
        data.put("totalInterviews", interviewRepository.count());
        data.put("avgPlacementReadiness", 76.4);

        // Interview mode distribution chart
        List<Map<String, Object>> modeDistribution = Arrays.asList(
            Map.of("name", "Text Interviews", "value", 210, "color", "#3b82f6"),
            Map.of("name", "Voice Interviews", "value", 152, "color", "#8b5cf6"),
            Map.of("name", "Video Interviews", "value", 90, "color", "#06b6d4")
        );
        data.put("modeDistribution", modeDistribution);

        // Monthly Student Registrations Trend
        List<Map<String, Object>> monthlyGrowth = Arrays.asList(
            Map.of("month", "May", "students", 45, "interviews", 120),
            Map.of("month", "Jun", "students", 68, "interviews", 210),
            Map.of("month", "Jul", "students", 94, "interviews", 340),
            Map.of("month", "Aug", "students", 128, "interviews", 452)
        );
        data.put("monthlyGrowth", monthlyGrowth);

        return data;
    }
}
