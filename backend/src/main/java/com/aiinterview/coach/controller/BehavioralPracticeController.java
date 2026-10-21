package com.aiinterview.coach.controller;

import com.aiinterview.coach.service.PlacementPrepService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/behavioral")
public class BehavioralPracticeController {

    @Autowired
    private PlacementPrepService placementPrepService;

    @PostMapping("/evaluate-star")
    public ResponseEntity<?> evaluateStar(@RequestBody Map<String, String> body) {
        try {
            String questionText = body.get("questionText");
            String answerText = body.get("answerText");

            Map<String, Object> result = placementPrepService.evaluateStarResponse(questionText, answerText);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
