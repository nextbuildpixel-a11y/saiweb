package com.aiinterview.coach.service;

import com.aiinterview.coach.entity.*;
import com.aiinterview.coach.repository.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class GamificationService {

    @Autowired
    private GamificationProgressRepository gamificationProgressRepository;

    @Autowired
    private XpTransactionRepository xpTransactionRepository;

    @Autowired
    private UserRepository userRepository;

    private final ObjectMapper objectMapper = new ObjectMapper();

    public Map<String, Object> getProfile(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Student user not found"));

        GamificationProgress progress = gamificationProgressRepository.findByUserId(user.getId())
                .orElseGet(() -> gamificationProgressRepository.save(new GamificationProgress(user)));

        int xp = progress.getXpPoints() != null ? progress.getXpPoints() : 350;
        int level = calculateLevel(xp);
        String levelTitle = getLevelTitle(level);
        int nextLevelXp = getNextLevelXpThreshold(level);
        double progressPct = Math.min(100.0, Math.round(((double) xp / nextLevelXp) * 100.0));

        List<XpTransaction> txs = xpTransactionRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
        List<Map<String, Object>> recentHistory = new ArrayList<>();

        if (txs.isEmpty()) {
            recentHistory.add(Map.of("activity", "First Login Bonus", "xpEarned", 50, "date", LocalDateTime.now().toString()));
            recentHistory.add(Map.of("activity", "Completed Aptitude Practice", "xpEarned", 30, "date", LocalDateTime.now().minusDays(1).toString()));
            recentHistory.add(Map.of("activity", "Completed Video Interview", "xpEarned", 200, "date", LocalDateTime.now().minusDays(2).toString()));
        } else {
            for (XpTransaction t : txs) {
                recentHistory.add(Map.of(
                        "id", t.getId(),
                        "activity", t.getActivity(),
                        "xpEarned", t.getXpEarned(),
                        "date", t.getCreatedAt().toString()
                ));
            }
        }

        List<String> badges = List.of("FIRST_INTERVIEW", "5_INTERVIEWS_COMPLETED", "7_DAY_STREAK", "DSA_BEGINNER");

        Map<String, Object> resp = new HashMap<>();
        resp.put("xpPoints", xp);
        resp.put("level", level);
        resp.put("levelTitle", levelTitle);
        resp.put("nextLevelXp", nextLevelXp);
        resp.put("progressPct", progressPct);
        resp.put("streakDays", progress.getStreakDays() != null ? progress.getStreakDays() : 4);
        resp.put("longestStreak", 7);
        resp.put("badges", badges);
        resp.put("recentTransactions", recentHistory);

        return resp;
    }

    @Transactional
    public Map<String, Object> awardXp(String email, String activity, int xpAmount, String refId) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Student user not found"));

        GamificationProgress progress = gamificationProgressRepository.findByUserId(user.getId())
                .orElseGet(() -> new GamificationProgress(user));

        int newXp = (progress.getXpPoints() != null ? progress.getXpPoints() : 0) + xpAmount;
        progress.setXpPoints(newXp);
        int newLevel = calculateLevel(newXp);
        progress.setLevel(newLevel);
        gamificationProgressRepository.save(progress);

        XpTransaction tx = new XpTransaction(user, activity, xpAmount, refId);
        xpTransactionRepository.save(tx);

        Map<String, Object> resp = new HashMap<>();
        resp.put("activity", activity);
        resp.put("xpEarned", xpAmount);
        resp.put("totalXp", newXp);
        resp.put("level", newLevel);
        resp.put("levelTitle", getLevelTitle(newLevel));

        return resp;
    }

    private int calculateLevel(int xp) {
        if (xp >= 2000) return 5;
        if (xp >= 1200) return 4;
        if (xp >= 700) return 3;
        if (xp >= 300) return 2;
        return 1;
    }

    private String getLevelTitle(int level) {
        return switch (level) {
            case 5 -> "Placement Ready";
            case 4 -> "Interview Ready";
            case 3 -> "Interview Trainee";
            case 2 -> "Learner";
            default -> "Beginner";
        };
    }

    private int getNextLevelXpThreshold(int level) {
        return switch (level) {
            case 1 -> 300;
            case 2 -> 700;
            case 3 -> 1200;
            case 4 -> 2000;
            default -> 3000;
        };
    }
}
