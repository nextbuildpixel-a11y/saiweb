package com.aiinterview.coach.service;

import com.aiinterview.coach.ai.AIService;
import com.aiinterview.coach.entity.*;
import com.aiinterview.coach.repository.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class PersonalizationService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SkillScoreRepository skillScoreRepository;

    @Autowired
    private ImprovementPlanRepository improvementPlanRepository;

    @Autowired
    private PlacementPrepService placementPrepService;

    @Autowired
    private AIService aiService;

    private final ObjectMapper objectMapper = new ObjectMapper();

    public Map<String, Object> getWeakAreas(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Student user not found"));

        List<SkillScore> scores = skillScoreRepository.findByUserId(user.getId());

        List<Map<String, Object>> strongSkills = new ArrayList<>();
        List<Map<String, Object>> goodSkills = new ArrayList<>();
        List<Map<String, Object>> averageSkills = new ArrayList<>();
        List<Map<String, Object>> weakSkills = new ArrayList<>();

        Map<String, Double> defaults = Map.of(
                "Java", 84.0,
                "SQL", 79.0,
                "Operating Systems", 75.0,
                "Communication", 68.0,
                "DSA", 54.0,
                "Aptitude", 65.0
        );

        for (Map.Entry<String, Double> entry : defaults.entrySet()) {
            String sName = entry.getKey();
            double sc = entry.getValue();

            for (SkillScore ss : scores) {
                if (ss.getSkill() != null && ss.getSkill().getName().equalsIgnoreCase(sName)) {
                    sc = ss.getScore();
                    break;
                }
            }

            Map<String, Object> item = new HashMap<>();
            item.put("skill", sName);
            item.put("score", sc);
            item.put("targetScore", 85.0);

            if (sc >= 80.0) {
                item.put("level", "STRONG");
                strongSkills.add(item);
            } else if (sc >= 70.0) {
                item.put("level", "GOOD");
                goodSkills.add(item);
            } else if (sc >= 60.0) {
                item.put("level", "AVERAGE");
                averageSkills.add(item);
            } else {
                item.put("level", "WEAK");
                item.put("priority", "HIGH");
                item.put("recommendation", "Practice 5 Arrays problems, 3 Linked List problems, and 2 Tree problems to improve core DSA proficiency.");
                weakSkills.add(item);
            }
        }

        Map<String, Object> result = new HashMap<>();
        result.put("strongSkills", strongSkills);
        result.put("goodSkills", goodSkills);
        result.put("averageSkills", averageSkills);
        result.put("weakSkills", weakSkills);
        result.put("topPriorityWeakArea", !weakSkills.isEmpty() ? weakSkills.get(0) : Map.of("skill", "DSA", "score", 54.0));

        return result;
    }

    @Transactional
    public ImprovementPlan generatePlan(int durationDays, String email) throws Exception {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Student user not found"));

        Map<String, Object> weakData = getWeakAreas(email);
        Map<String, Object> topWeak = (Map<String, Object>) weakData.get("topPriorityWeakArea");
        String weakSkill = topWeak.get("skill").toString();

        ImprovementPlan plan = new ImprovementPlan();
        plan.setUser(user);
        plan.setSkillName(weakSkill);
        plan.setTitle(durationDays + "-Day Personalized Placement Preparation Plan");
        plan.setDurationDays(durationDays);
        plan.setStatus("ACTIVE");

        List<Map<String, Object>> dailyTasks = new ArrayList<>();
        String[] focusTopics = {"Java OOP & Syntax", "Arrays & String Manipulation", "SQL & Relational DBMS", "Voice & Communication Skills", "DSA Stacks & Queues", "Behavioral STAR Framework", "Full Mock Placement Simulation"};

        for (int day = 1; day <= durationDays; day++) {
            Map<String, Object> task = new HashMap<>();
            task.put("day", day);
            task.put("title", "Day " + day + ": " + focusTopics[(day - 1) % focusTopics.length]);
            task.put("activity", "Practice " + (3 + (day % 3)) + " curated questions & coding problems focused on " + weakSkill);
            task.put("completed", false);
            dailyTasks.add(task);
        }

        plan.setDescriptionText(objectMapper.writeValueAsString(dailyTasks));
        return improvementPlanRepository.save(plan);
    }

    public Map<String, Object> getCurrentPlan(String email) throws Exception {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Student user not found"));

        List<ImprovementPlan> plans = improvementPlanRepository.findByUserId(user.getId());
        ImprovementPlan activePlan = plans.stream()
                .filter(p -> "ACTIVE".equalsIgnoreCase(p.getStatus()))
                .findFirst()
                .orElse(null);

        if (activePlan == null) {
            // Generate a default 7-Day Plan if none exists
            activePlan = generatePlan(7, email);
        }

        Map<String, Object> resp = new HashMap<>();
        resp.put("id", activePlan.getId());
        resp.put("title", activePlan.getTitle());
        resp.put("skillName", activePlan.getSkillName());
        resp.put("durationDays", activePlan.getDurationDays());
        resp.put("status", activePlan.getStatus());
        resp.put("createdAt", activePlan.getCreatedAt());

        if (activePlan.getDescriptionText() != null && activePlan.getDescriptionText().startsWith("[")) {
            resp.put("dailyTasks", objectMapper.readValue(activePlan.getDescriptionText(), List.class));
        } else {
            resp.put("dailyTasks", Collections.emptyList());
        }

        return resp;
    }

    public List<Map<String, Object>> getDailyPracticeQueue(String email) {
        List<Map<String, Object>> queue = new ArrayList<>();

        Map<String, Object> t1 = new HashMap<>();
        t1.put("id", 1);
        t1.put("type", "CODING");
        t1.put("title", "Solve Two Sum Target Index Pair");
        t1.put("category", "DSA & Arrays");
        t1.put("difficulty", "Easy");
        t1.put("status", "PENDING");
        queue.add(t1);

        Map<String, Object> t2 = new HashMap<>();
        t2.put("id", 2);
        t2.put("type", "APTITUDE");
        t2.put("title", "Complete 5 Quantitative Aptitude MCQs");
        t2.put("category", "Aptitude");
        t2.put("difficulty", "Medium");
        t2.put("status", "PENDING");
        queue.add(t2);

        Map<String, Object> t3 = new HashMap<>();
        t3.put("id", 3);
        t3.put("type", "BEHAVIORAL");
        t3.put("title", "Practice STAR Response for Technical Challenge");
        t3.put("category", "HR & Behavioral");
        t3.put("difficulty", "Medium");
        t3.put("status", "PENDING");
        queue.add(t3);

        return queue;
    }
}
