package com.aiinterview.coach.controller;

import com.aiinterview.coach.security.UserPrincipal;
import com.aiinterview.coach.service.JobDescriptionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;

@RestController
@RequestMapping("/api/job-descriptions")
public class JobDescriptionController {

    @Autowired
    private JobDescriptionService jobDescriptionService;

    @PostMapping("/analyze")
    public ResponseEntity<?> analyzeJobDescription(
            @RequestParam(value = "roleTitle", required = false) String roleTitle,
            @RequestParam(value = "companyName", required = false) String companyName,
            @RequestParam(value = "descriptionText", required = false) String descriptionText,
            @RequestParam(value = "file", required = false) MultipartFile file,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        if (currentUser == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized access"));
        }

        try {
            Map<String, Object> result = jobDescriptionService.analyzeJobDescription(
                    roleTitle, companyName, descriptionText, file, currentUser.getEmail()
            );
            return ResponseEntity.ok(result);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Job description analysis failed: " + e.getMessage()));
        }
    }

    @GetMapping("/history")
    public ResponseEntity<?> getHistory(@AuthenticationPrincipal UserPrincipal currentUser) {
        if (currentUser == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized access"));
        }

        List<Map<String, Object>> history = jobDescriptionService.getJobDescriptionHistory(currentUser.getEmail());
        return ResponseEntity.ok(history);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        if (currentUser == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized access"));
        }

        try {
            Map<String, Object> result = jobDescriptionService.getJobDescriptionById(id, currentUser.getEmail());
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(404).body(Map.of("error", e.getMessage()));
        }
    }
}
