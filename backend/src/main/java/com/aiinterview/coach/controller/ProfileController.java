package com.aiinterview.coach.controller;

import com.aiinterview.coach.entity.GamificationProgress;
import com.aiinterview.coach.entity.Interview;
import com.aiinterview.coach.entity.Skill;
import com.aiinterview.coach.entity.SkillScore;
import com.aiinterview.coach.entity.User;
import com.aiinterview.coach.repository.GamificationProgressRepository;
import com.aiinterview.coach.repository.InterviewRepository;
import com.aiinterview.coach.repository.SkillRepository;
import com.aiinterview.coach.repository.SkillScoreRepository;
import com.aiinterview.coach.repository.UserRepository;
import com.aiinterview.coach.security.UserPrincipal;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.*;

@RestController
@RequestMapping({"/api/profile", "/api/user/profile"})
public class ProfileController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private InterviewRepository interviewRepository;

    @Autowired
    private SkillScoreRepository skillScoreRepository;

    @Autowired
    private SkillRepository skillRepository;

    @Autowired
    private GamificationProgressRepository gamificationProgressRepository;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @GetMapping
    public ResponseEntity<?> getProfile(@AuthenticationPrincipal UserPrincipal currentUser) {
        if (currentUser == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized access"));
        }

        User user = userRepository.findByEmail(currentUser.getEmail())
                .orElseThrow(() -> new RuntimeException("User profile not found"));

        Map<String, Object> profile = new LinkedHashMap<>();
        profile.put("id", user.getId());
        profile.put("fullName", user.getFullName());
        profile.put("email", user.getEmail());
        profile.put("phone", user.getPhone() != null ? user.getPhone() : "");
        profile.put("college", user.getCollege() != null ? user.getCollege() : "");
        profile.put("degree", user.getDegree() != null ? user.getDegree() : "B.Tech");
        profile.put("branch", user.getBranch() != null ? user.getBranch() : "Computer Science");
        profile.put("graduationYear", user.getGraduationYear() != null ? user.getGraduationYear() : 2026);
        profile.put("cgpa", user.getCgpa() != null ? user.getCgpa() : 8.5);
        profile.put("role", user.getRole());
        profile.put("active", user.isActive());
        profile.put("createdAt", user.getCreatedAt() != null ? user.getCreatedAt().toString() : "");

        // Target role & experience level
        profile.put("targetRole", user.getTargetRole() != null && !user.getTargetRole().trim().isEmpty() ? user.getTargetRole() : "Full Stack Developer");
        profile.put("experienceLevel", user.getExperienceLevel() != null && !user.getExperienceLevel().trim().isEmpty() ? user.getExperienceLevel() : "Student");
        profile.put("bio", user.getBio() != null ? user.getBio() : "Passionate developer preparing for placement drives, software engineering roles, and algorithmic challenges.");

        // Avatar URL
        String defaultAvatar = "https://api.dicebear.com/7.x/avataaars/svg?seed=" + 
                URLEncoder.encode(user.getFullName() != null ? user.getFullName() : "Candidate", StandardCharsets.UTF_8) + 
                "&backgroundColor=b6e3f4,c0aede,d1d4f9";
        profile.put("avatarUrl", user.getAvatarUrl() != null && !user.getAvatarUrl().trim().isEmpty() ? user.getAvatarUrl() : defaultAvatar);

        // Social Links
        Map<String, String> socialLinks = new LinkedHashMap<>();
        socialLinks.put("github", user.getGithubUrl() != null ? user.getGithubUrl() : "");
        socialLinks.put("linkedin", user.getLinkedinUrl() != null ? user.getLinkedinUrl() : "");
        socialLinks.put("portfolio", user.getPortfolioUrl() != null ? user.getPortfolioUrl() : "");
        profile.put("socialLinks", socialLinks);

        // Target skills list
        List<String> targetSkillsList = parseTargetSkills(user.getTargetSkills());
        profile.put("targetSkills", targetSkillsList);

        // Fetch Target Skills with proficiency scores
        List<SkillScore> skillScores = skillScoreRepository.findByUserId(user.getId());
        List<Map<String, Object>> skillProficiencies = new ArrayList<>();
        if (skillScores != null && !skillScores.isEmpty()) {
            for (SkillScore ss : skillScores) {
                Map<String, Object> sk = new HashMap<>();
                sk.put("name", ss.getSkill() != null ? ss.getSkill().getName() : "General Skill");
                sk.put("category", ss.getSkill() != null ? ss.getSkill().getCategory() : "TECHNICAL");
                sk.put("score", ss.getScore() != null ? Math.round(ss.getScore()) : 0);
                skillProficiencies.add(sk);
            }
        } else {
            // Seed skill proficiencies corresponding to target skills
            for (String ts : targetSkillsList) {
                skillProficiencies.add(Map.of("name", ts, "category", "TECHNICAL", "score", 75));
            }
        }
        profile.put("skillProficiencies", skillProficiencies);

        // Fetch User Interview Statistics
        List<Interview> userInterviews = interviewRepository.findByUserIdOrderByStartedAtDesc(user.getId());
        int totalInterviews = userInterviews != null ? userInterviews.size() : 0;
        int completedCount = 0;
        int totalScoreSum = 0;
        int highestScore = 0;
        int textCount = 0;
        int voiceCount = 0;
        int videoCount = 0;

        List<Map<String, Object>> recentHistory = new ArrayList<>();

        if (userInterviews != null) {
            for (Interview inv : userInterviews) {
                String mode = inv.getMode() != null ? inv.getMode().toUpperCase() : "TEXT";
                if (mode.contains("TEXT")) textCount++;
                else if (mode.contains("VOICE")) voiceCount++;
                else if (mode.contains("VIDEO")) videoCount++;

                int score = inv.getFinalScore() != null ? Math.round(inv.getFinalScore().floatValue()) : 0;

                if ("COMPLETED".equalsIgnoreCase(inv.getStatus())) {
                    completedCount++;
                    totalScoreSum += score;
                    if (score > highestScore) highestScore = score;
                }

                if (recentHistory.size() < 5) {
                    Map<String, Object> h = new HashMap<>();
                    h.put("id", inv.getId());
                    h.put("mode", inv.getMode() != null ? inv.getMode() : "Text");
                    h.put("company", inv.getCompany() != null ? inv.getCompany().getName() : "General Practice");
                    h.put("role", inv.getJobRole() != null ? inv.getJobRole().getTitle() : "Software Engineer");
                    h.put("score", score);
                    h.put("status", inv.getStatus() != null ? inv.getStatus() : "COMPLETED");
                    h.put("startedAt", inv.getStartedAt() != null ? inv.getStartedAt().toLocalDate().toString() : "");
                    recentHistory.add(h);
                }
            }
        }

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalInterviews", totalInterviews);
        stats.put("completedInterviews", completedCount);
        stats.put("averageScore", completedCount > 0 ? Math.round((float) totalScoreSum / completedCount) : 0);
        stats.put("highestScore", highestScore);
        stats.put("textInterviews", textCount);
        stats.put("voiceInterviews", voiceCount);
        stats.put("videoInterviews", videoCount);
        profile.put("stats", stats);
        profile.put("recentInterviews", recentHistory);

        // Fetch Gamification Progress
        Optional<GamificationProgress> gamification = gamificationProgressRepository.findByUserId(user.getId());
        Map<String, Object> gameData = new HashMap<>();
        if (gamification.isPresent()) {
            GamificationProgress gp = gamification.get();
            gameData.put("level", gp.getLevel() != null ? gp.getLevel() : 1);
            gameData.put("xpPoints", gp.getXpPoints() != null ? gp.getXpPoints() : 0);
            gameData.put("streakDays", gp.getStreakDays() != null ? gp.getStreakDays() : 0);
            gameData.put("badges", gp.getBadgesJson() != null ? gp.getBadgesJson() : "[]");
        } else {
            gameData.put("level", 1);
            gameData.put("xpPoints", 120);
            gameData.put("streakDays", 3);
            gameData.put("badges", "[\"FIRST_INTERVIEW\"]");
        }
        profile.put("gamification", gameData);

        return ResponseEntity.ok(profile);
    }

    @PutMapping
    public ResponseEntity<?> updateProfile(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @RequestBody Map<String, Object> payload) {

        if (currentUser == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized access"));
        }

        User user = userRepository.findByEmail(currentUser.getEmail())
                .orElseThrow(() -> new RuntimeException("User profile not found"));

        // Validation: Full Name
        if (payload.containsKey("fullName")) {
            String name = payload.get("fullName") != null ? payload.get("fullName").toString().trim() : "";
            if (name.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Full Name cannot be empty."));
            }
            user.setFullName(name);
        }

        // Phone
        if (payload.containsKey("phone") && payload.get("phone") != null) {
            user.setPhone(payload.get("phone").toString().trim());
        }

        // Academic details
        if (payload.containsKey("college") && payload.get("college") != null) {
            user.setCollege(payload.get("college").toString().trim());
        }
        if (payload.containsKey("degree") && payload.get("degree") != null) {
            user.setDegree(payload.get("degree").toString().trim());
        }
        if (payload.containsKey("branch") && payload.get("branch") != null) {
            user.setBranch(payload.get("branch").toString().trim());
        }
        if (payload.containsKey("graduationYear") && payload.get("graduationYear") != null) {
            try {
                user.setGraduationYear(Integer.parseInt(payload.get("graduationYear").toString()));
            } catch (Exception ignored) {}
        }
        if (payload.containsKey("cgpa") && payload.get("cgpa") != null) {
            try {
                user.setCgpa(Double.parseDouble(payload.get("cgpa").toString()));
            } catch (Exception ignored) {}
        }

        // Avatar URL
        if (payload.containsKey("avatarUrl") && payload.get("avatarUrl") != null) {
            String avatar = payload.get("avatarUrl").toString().trim();
            user.setAvatarUrl(avatar);
        }

        // Target Role
        if (payload.containsKey("targetRole") && payload.get("targetRole") != null) {
            String role = payload.get("targetRole").toString().trim();
            if (!role.isEmpty()) {
                user.setTargetRole(role);
            }
        }

        // Experience Level: Student, Entry-level, Mid-level, Senior
        if (payload.containsKey("experienceLevel") && payload.get("experienceLevel") != null) {
            String exp = payload.get("experienceLevel").toString().trim();
            if (Arrays.asList("Student", "Entry-level", "Mid-level", "Senior").contains(exp)) {
                user.setExperienceLevel(exp);
            } else if (!exp.isEmpty()) {
                user.setExperienceLevel(exp);
            }
        }

        // Bio (max 300 characters validation)
        if (payload.containsKey("bio")) {
            String bio = payload.get("bio") != null ? payload.get("bio").toString().trim() : "";
            if (bio.length() > 300) {
                bio = bio.substring(0, 300);
            }
            user.setBio(bio);
        }

        // Social Links: github, linkedin, portfolio
        if (payload.containsKey("socialLinks") && payload.get("socialLinks") instanceof Map) {
            Map<?, ?> sLinks = (Map<?, ?>) payload.get("socialLinks");
            if (sLinks.get("github") != null) {
                user.setGithubUrl(sanitizeUrl(sLinks.get("github").toString()));
            }
            if (sLinks.get("linkedin") != null) {
                user.setLinkedinUrl(sanitizeUrl(sLinks.get("linkedin").toString()));
            }
            if (sLinks.get("portfolio") != null) {
                user.setPortfolioUrl(sanitizeUrl(sLinks.get("portfolio").toString()));
            }
        } else {
            if (payload.containsKey("githubUrl") && payload.get("githubUrl") != null) {
                user.setGithubUrl(sanitizeUrl(payload.get("githubUrl").toString()));
            }
            if (payload.containsKey("linkedinUrl") && payload.get("linkedinUrl") != null) {
                user.setLinkedinUrl(sanitizeUrl(payload.get("linkedinUrl").toString()));
            }
            if (payload.containsKey("portfolioUrl") && payload.get("portfolioUrl") != null) {
                user.setPortfolioUrl(sanitizeUrl(payload.get("portfolioUrl").toString()));
            }
        }

        // Target Skills: array of strings
        if (payload.containsKey("targetSkills")) {
            Object rawSkills = payload.get("targetSkills");
            List<String> cleanedSkills = new ArrayList<>();
            if (rawSkills instanceof List) {
                for (Object s : (List<?>) rawSkills) {
                    if (s != null && !s.toString().trim().isEmpty()) {
                        cleanedSkills.add(s.toString().trim());
                    }
                }
            } else if (rawSkills instanceof String) {
                cleanedSkills = parseTargetSkills(rawSkills.toString());
            }

            try {
                user.setTargetSkills(objectMapper.writeValueAsString(cleanedSkills));
            } catch (Exception e) {
                user.setTargetSkills(String.join(",", cleanedSkills));
            }

            // Also synchronize skill scores if skills were updated
            for (String skillName : cleanedSkills) {
                Skill skill = skillRepository.findByName(skillName).orElseGet(() -> {
                    Skill s = new Skill(skillName, "TECHNICAL");
                    return skillRepository.save(s);
                });
                Optional<SkillScore> ssOpt = skillScoreRepository.findByUserIdAndSkillId(user.getId(), skill.getId());
                if (ssOpt.isEmpty()) {
                    SkillScore newScore = new SkillScore(user, skill, 70.0);
                    skillScoreRepository.save(newScore);
                }
            }
        }

        userRepository.save(user);

        return getProfile(currentUser);
    }

    private List<String> parseTargetSkills(String raw) {
        if (raw == null || raw.trim().isEmpty()) {
            return new ArrayList<>(Arrays.asList("Java", "Data Structures", "SQL", "System Design", "React"));
        }
        try {
            if (raw.trim().startsWith("[")) {
                return objectMapper.readValue(raw, new TypeReference<List<String>>() {});
            }
        } catch (Exception ignored) {}

        String[] parts = raw.split(",");
        List<String> list = new ArrayList<>();
        for (String p : parts) {
            String trimmed = p.trim().replaceAll("[\"'\\[\\]]", "");
            if (!trimmed.isEmpty()) list.add(trimmed);
        }
        return list.isEmpty() ? new ArrayList<>(Arrays.asList("Java", "Data Structures", "SQL", "React")) : list;
    }

    private String sanitizeUrl(String raw) {
        if (raw == null) return "";
        String trimmed = raw.trim();
        if (trimmed.isEmpty()) return "";
        if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
            return "https://" + trimmed;
        }
        return trimmed;
    }
}


