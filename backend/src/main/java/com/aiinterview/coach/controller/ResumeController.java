package com.aiinterview.coach.controller;

import com.aiinterview.coach.entity.Resume;
import com.aiinterview.coach.security.UserPrincipal;
import com.aiinterview.coach.service.ResumeService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;

@RestController
@RequestMapping("/api/resumes")
public class ResumeController {

    @Autowired
    private ResumeService resumeService;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @PostMapping("/upload")
    public ResponseEntity<?> uploadResume(
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        if (currentUser == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized access"));
        }

        try {
            Resume resume = resumeService.uploadResume(file, currentUser.getEmail());
            
            Map<String, Object> response = new HashMap<>();
            response.put("id", resume.getId());
            response.put("fileName", resume.getFileName());
            response.put("atsScore", resume.getAtsScore());
            response.put("extractedText", resume.getExtractedText());
            response.put("uploadedAt", resume.getUploadedAt());
            if (resume.getAnalysisJson() != null) {
                response.put("analysis", objectMapper.readValue(resume.getAnalysisJson(), Map.class));
            }

            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Resume upload processing failed: " + e.getMessage()));
        }
    }

    @GetMapping("/latest")
    public ResponseEntity<?> getLatestResume(@AuthenticationPrincipal UserPrincipal currentUser) {
        if (currentUser == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized access"));
        }

        Optional<Resume> resumeOpt = resumeService.getLatestResume(currentUser.getEmail());
        if (resumeOpt.isEmpty()) {
            return ResponseEntity.ok(Map.of("hasResume", false));
        }

        Resume resume = resumeOpt.get();
        Map<String, Object> response = new HashMap<>();
        response.put("hasResume", true);
        response.put("id", resume.getId());
        response.put("fileName", resume.getFileName());
        response.put("atsScore", resume.getAtsScore());
        response.put("extractedText", resume.getExtractedText());
        response.put("uploadedAt", resume.getUploadedAt());
        try {
            if (resume.getAnalysisJson() != null) {
                response.put("analysis", objectMapper.readValue(resume.getAnalysisJson(), Map.class));
            }
        } catch (Exception ignored) {}

        return ResponseEntity.ok(response);
    }

    @GetMapping("/history")
    public ResponseEntity<?> getResumeHistory(@AuthenticationPrincipal UserPrincipal currentUser) {
        if (currentUser == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized access"));
        }

        List<Resume> history = resumeService.getResumeHistory(currentUser.getEmail());
        List<Map<String, Object>> result = new ArrayList<>();

        for (Resume r : history) {
            Map<String, Object> item = new HashMap<>();
            item.put("id", r.getId());
            item.put("fileName", r.getFileName());
            item.put("atsScore", r.getAtsScore());
            item.put("uploadedAt", r.getUploadedAt());
            result.add(item);
        }

        return ResponseEntity.ok(result);
    }

    @PostMapping("/{id}/analyze")
    public ResponseEntity<?> analyzeResume(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        if (currentUser == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized access"));
        }

        try {
            Map<String, Object> analysis = resumeService.analyzeResume(id, currentUser.getEmail());
            return ResponseEntity.ok(analysis);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }
}
