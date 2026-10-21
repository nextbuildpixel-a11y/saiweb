package com.aiinterview.coach.controller;

import com.aiinterview.coach.entity.ImprovementPlan;
import com.aiinterview.coach.security.UserPrincipal;
import com.aiinterview.coach.service.PersonalizationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/personalization")
public class PersonalizationController {

    @Autowired
    private PersonalizationService personalizationService;

    @GetMapping("/weak-areas")
    public ResponseEntity<?> getWeakAreas(@AuthenticationPrincipal UserPrincipal currentUser) {
        if (currentUser == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized access"));
        }
        try {
            Map<String, Object> result = personalizationService.getWeakAreas(currentUser.getEmail());
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/plans/generate")
    public ResponseEntity<?> generatePlan(
            @RequestBody Map<String, Object> body,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        if (currentUser == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized access"));
        }
        try {
            int durationDays = body.get("durationDays") != null ? Integer.parseInt(body.get("durationDays").toString()) : 7;
            ImprovementPlan plan = personalizationService.generatePlan(durationDays, currentUser.getEmail());
            return ResponseEntity.ok(Map.of(
                    "planId", plan.getId(),
                    "title", plan.getTitle(),
                    "status", plan.getStatus()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/plans/current")
    public ResponseEntity<?> getCurrentPlan(@AuthenticationPrincipal UserPrincipal currentUser) {
        if (currentUser == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized access"));
        }
        try {
            Map<String, Object> result = personalizationService.getCurrentPlan(currentUser.getEmail());
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/daily-queue")
    public ResponseEntity<?> getDailyPracticeQueue(@AuthenticationPrincipal UserPrincipal currentUser) {
        if (currentUser == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized access"));
        }
        try {
            var queue = personalizationService.getDailyPracticeQueue(currentUser.getEmail());
            return ResponseEntity.ok(queue);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
