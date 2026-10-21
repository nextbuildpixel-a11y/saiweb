package com.aiinterview.coach.controller;

import com.aiinterview.coach.entity.MockPlacementDrive;
import com.aiinterview.coach.security.UserPrincipal;
import com.aiinterview.coach.service.MockPlacementDriveService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/placement-drives")
public class MockPlacementDriveController {

    @Autowired
    private MockPlacementDriveService mockPlacementDriveService;

    @PostMapping("/create")
    public ResponseEntity<?> createDrive(
            @RequestBody Map<String, Object> body,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        if (currentUser == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized access"));
        }

        try {
            Long companyId = body.get("companyId") != null ? Long.valueOf(body.get("companyId").toString()) : null;
            Long jobRoleId = body.get("jobRoleId") != null ? Long.valueOf(body.get("jobRoleId").toString()) : null;

            MockPlacementDrive drive = mockPlacementDriveService.createDrive(companyId, jobRoleId, currentUser.getEmail());
            return ResponseEntity.ok(Map.of(
                    "driveId", drive.getId(),
                    "status", drive.getStatus()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{id}/current-round")
    public ResponseEntity<?> getCurrentRound(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        if (currentUser == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized access"));
        }

        try {
            Map<String, Object> result = mockPlacementDriveService.getCurrentRound(id, currentUser.getEmail());
            return ResponseEntity.ok(result);
        } catch (SecurityException e) {
            return ResponseEntity.status(403).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{id}/submit-round")
    public ResponseEntity<?> submitRound(
            @PathVariable Long id,
            @RequestBody Map<String, Object> payload,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        if (currentUser == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized access"));
        }

        try {
            Map<String, Object> result = mockPlacementDriveService.submitRound(id, payload, currentUser.getEmail());
            return ResponseEntity.ok(result);
        } catch (SecurityException e) {
            return ResponseEntity.status(403).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{id}/report")
    public ResponseEntity<?> getDriveReport(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        if (currentUser == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized access"));
        }

        try {
            Map<String, Object> result = mockPlacementDriveService.getDriveReport(id, currentUser.getEmail());
            return ResponseEntity.ok(result);
        } catch (SecurityException e) {
            return ResponseEntity.status(403).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }
}
