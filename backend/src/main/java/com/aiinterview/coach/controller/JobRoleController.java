package com.aiinterview.coach.controller;

import com.aiinterview.coach.entity.JobRole;
import com.aiinterview.coach.service.JobRoleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class JobRoleController {

    @Autowired
    private JobRoleService jobRoleService;

    // Public / Student Endpoint
    @GetMapping("/job-roles")
    public ResponseEntity<List<JobRole>> getAllJobRoles() {
        return ResponseEntity.ok(jobRoleService.getAllJobRoles());
    }

    @GetMapping("/job-roles/{id}")
    public ResponseEntity<?> getJobRoleById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(jobRoleService.getJobRoleById(id));
        } catch (Exception e) {
            return ResponseEntity.status(404).body(Map.of("error", e.getMessage()));
        }
    }

    // Admin Protected Endpoints
    @PostMapping("/admin/job-roles")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createJobRole(@RequestBody JobRole role) {
        try {
            return ResponseEntity.ok(jobRoleService.createJobRole(role));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/admin/job-roles/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateJobRole(@PathVariable Long id, @RequestBody JobRole role) {
        try {
            return ResponseEntity.ok(jobRoleService.updateJobRole(id, role));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/admin/job-roles/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteJobRole(@PathVariable Long id) {
        jobRoleService.deleteJobRole(id);
        return ResponseEntity.ok(Map.of("message", "Job role deleted successfully"));
    }
}
