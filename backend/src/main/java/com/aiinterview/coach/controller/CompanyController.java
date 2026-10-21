package com.aiinterview.coach.controller;

import com.aiinterview.coach.entity.Company;
import com.aiinterview.coach.service.CompanyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class CompanyController {

    @Autowired
    private CompanyService companyService;

    // Public / Student Endpoints
    @GetMapping("/companies")
    public ResponseEntity<List<Map<String, Object>>> getCompanies(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String industry) {
        return ResponseEntity.ok(companyService.getAllCompanies(search, industry));
    }

    @GetMapping("/companies/{id}")
    public ResponseEntity<?> getCompanyDetails(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(companyService.getCompanyDetails(id));
        } catch (Exception e) {
            return ResponseEntity.status(404).body(Map.of("error", e.getMessage()));
        }
    }

    // Admin Protected Endpoints
    @PostMapping("/admin/companies")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createCompany(@RequestBody Company company) {
        try {
            return ResponseEntity.ok(companyService.createCompany(company));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/admin/companies/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateCompany(@PathVariable Long id, @RequestBody Company company) {
        try {
            return ResponseEntity.ok(companyService.updateCompany(id, company));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/admin/companies/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteCompany(@PathVariable Long id) {
        companyService.deleteCompany(id);
        return ResponseEntity.ok(Map.of("message", "Company profile deleted successfully"));
    }

    @PatchMapping("/admin/companies/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> toggleStatus(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(companyService.toggleCompanyStatus(id));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/admin/company-roles")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> mapRoleToCompany(@RequestBody Map<String, Object> body) {
        try {
            Long companyId = Long.valueOf(body.get("companyId").toString());
            Long jobRoleId = Long.valueOf(body.get("jobRoleId").toString());
            String difficultyLevel = (String) body.get("difficultyLevel");
            String roleDescription = (String) body.get("roleDescription");

            return ResponseEntity.ok(companyService.mapRoleToCompany(companyId, jobRoleId, difficultyLevel, roleDescription));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/admin/company-roles/{id}/skills")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> addSkillToCompanyRole(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body) {
        try {
            Long skillId = Long.valueOf(body.get("skillId").toString());
            String importance = (String) body.get("importance");
            String requiredLevel = (String) body.get("requiredLevel");

            return ResponseEntity.ok(companyService.addSkillToCompanyRole(id, skillId, importance, requiredLevel));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/admin/companies/{id}/sources")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> addPreparationSource(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body) {
        try {
            String sourceTitle = (String) body.get("sourceTitle");
            String sourceUrl = (String) body.get("sourceUrl");
            String descriptionNotes = (String) body.get("descriptionNotes");

            return ResponseEntity.ok(companyService.addPreparationSource(id, sourceTitle, sourceUrl, descriptionNotes));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
