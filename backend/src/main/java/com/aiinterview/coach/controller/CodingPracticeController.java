package com.aiinterview.coach.controller;

import com.aiinterview.coach.entity.CodingProblem;
import com.aiinterview.coach.security.UserPrincipal;
import com.aiinterview.coach.service.PlacementPrepService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/coding")
public class CodingPracticeController {

    @Autowired
    private PlacementPrepService placementPrepService;

    @GetMapping("/problems")
    public ResponseEntity<?> getProblems(
            @RequestParam(required = false) String topic,
            @RequestParam(required = false) String difficulty) {
        try {
            List<CodingProblem> problems = placementPrepService.getCodingProblems(topic, difficulty);
            return ResponseEntity.ok(problems);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/problems/{id}/submit")
    public ResponseEntity<?> submitCode(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        if (currentUser == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized access"));
        }

        try {
            String code = body.get("code");
            Map<String, Object> result = placementPrepService.submitCodeSolution(id, code, currentUser.getEmail());
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
