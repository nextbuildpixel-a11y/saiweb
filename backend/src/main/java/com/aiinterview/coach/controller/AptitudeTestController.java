package com.aiinterview.coach.controller;

import com.aiinterview.coach.security.UserPrincipal;
import com.aiinterview.coach.service.PlacementPrepService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/aptitude")
public class AptitudeTestController {

    @Autowired
    private PlacementPrepService placementPrepService;

    @GetMapping("/questions")
    public ResponseEntity<?> getQuestions(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String difficulty) {
        try {
            List<Map<String, Object>> list = placementPrepService.getQuestions(category, difficulty);
            return ResponseEntity.ok(list);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/submit")
    public ResponseEntity<?> submitTestAttempt(
            @RequestBody Map<String, Object> payload,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        if (currentUser == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized access"));
        }

        try {
            String category = (String) payload.get("category");
            Map<String, String> answers = (Map<String, String>) payload.get("answers");

            Map<String, Object> result = placementPrepService.submitTestAttempt(answers, category, currentUser.getEmail());
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
