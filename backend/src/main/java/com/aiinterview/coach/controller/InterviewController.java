package com.aiinterview.coach.controller;

import com.aiinterview.coach.entity.Interview;
import com.aiinterview.coach.security.UserPrincipal;
import com.aiinterview.coach.service.InterviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/interviews")
public class InterviewController {

    @Autowired
    private InterviewService interviewService;

    @PostMapping("/create")
    public ResponseEntity<?> createInterview(
            @RequestBody Map<String, Object> body,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        if (currentUser == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized access"));
        }

        try {
            Long companyId = body.get("companyId") != null ? Long.valueOf(body.get("companyId").toString()) : null;
            Long jobRoleId = body.get("jobRoleId") != null ? Long.valueOf(body.get("jobRoleId").toString()) : null;
            String mode = (String) body.get("mode");
            String interviewType = (String) body.get("interviewType");
            String difficulty = (String) body.get("difficulty");
            Integer totalQuestions = body.get("totalQuestions") != null ? Integer.valueOf(body.get("totalQuestions").toString()) : 3;
            boolean useResume = Boolean.TRUE.equals(body.get("useResume"));
            boolean useJd = Boolean.TRUE.equals(body.get("useJd"));

            Interview interview = interviewService.createInterview(
                    companyId, jobRoleId, mode, interviewType, difficulty, totalQuestions, useResume, useJd, currentUser.getEmail()
            );

            return ResponseEntity.ok(Map.of(
                    "interviewId", interview.getId(),
                    "status", interview.getStatus(),
                    "mode", interview.getMode(),
                    "totalQuestions", interview.getTotalQuestions()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{id}/current-question")
    public ResponseEntity<?> getCurrentQuestion(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        if (currentUser == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized access"));
        }

        try {
            Map<String, Object> question = interviewService.getCurrentQuestion(id, currentUser.getEmail());
            return ResponseEntity.ok(question);
        } catch (SecurityException e) {
            return ResponseEntity.status(403).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{id}/submit-answer")
    public ResponseEntity<?> submitAnswer(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        if (currentUser == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized access"));
        }

        try {
            String answerText = (String) body.get("answerText");
            String answerType = (String) body.get("answerType");
            Integer speakingDuration = body.get("speakingDuration") != null ? Integer.valueOf(body.get("speakingDuration").toString()) : null;
            String audioFilePath = (String) body.get("audioFilePath");
            String videoFilePath = (String) body.get("videoFilePath");

            Map<String, Object> result = interviewService.submitAnswer(
                    id, answerText, answerType, speakingDuration, audioFilePath, videoFilePath, currentUser.getEmail()
            );
            return ResponseEntity.ok(result);
        } catch (SecurityException e) {
            return ResponseEntity.status(403).body(Map.of("error", e.getMessage()));
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{id}/complete")
    public ResponseEntity<?> completeInterview(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        if (currentUser == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized access"));
        }

        try {
            Map<String, Object> result = interviewService.completeInterview(id, currentUser.getEmail());
            return ResponseEntity.ok(result);
        } catch (SecurityException e) {
            return ResponseEntity.status(403).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{id}/result")
    public ResponseEntity<?> getInterviewResult(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        if (currentUser == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized access"));
        }

        try {
            Map<String, Object> result = interviewService.getInterviewResult(id, currentUser.getEmail());
            return ResponseEntity.ok(result);
        } catch (SecurityException e) {
            return ResponseEntity.status(403).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/history")
    public ResponseEntity<?> getInterviewHistory(@AuthenticationPrincipal UserPrincipal currentUser) {
        if (currentUser == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized access"));
        }

        try {
            var result = interviewService.getInterviewHistory(currentUser.getEmail());
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }
}
