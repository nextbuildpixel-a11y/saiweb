package com.aiinterview.coach.controller;

import com.aiinterview.coach.security.UserPrincipal;
import com.aiinterview.coach.service.GamificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/gamification")
public class GamificationController {

    @Autowired
    private GamificationService gamificationService;

    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(@AuthenticationPrincipal UserPrincipal currentUser) {
        if (currentUser == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized access"));
        }
        try {
            Map<String, Object> result = gamificationService.getProfile(currentUser.getEmail());
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/award-xp")
    public ResponseEntity<?> awardXp(
            @RequestBody Map<String, Object> body,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        if (currentUser == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized access"));
        }
        try {
            String activity = (String) body.get("activity");
            int xpAmount = body.get("xpAmount") != null ? Integer.parseInt(body.get("xpAmount").toString()) : 50;
            String refId = (String) body.get("refId");

            Map<String, Object> result = gamificationService.awardXp(currentUser.getEmail(), activity, xpAmount, refId);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
