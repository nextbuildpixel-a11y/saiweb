package com.aiinterview.coach.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "company_roles")
public class CompanyRole {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id", nullable = false)
    private Company company;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_role_id", nullable = false)
    private JobRole jobRole;

    @Column(name = "difficulty_level")
    private String difficultyLevel; // EASY, MEDIUM, HARD, ADAPTIVE

    @Column(name = "role_description", columnDefinition = "TEXT")
    private String roleDescription;

    public CompanyRole() {}

    public CompanyRole(Company company, JobRole jobRole, String difficultyLevel, String roleDescription) {
        this.company = company;
        this.jobRole = jobRole;
        this.difficultyLevel = difficultyLevel;
        this.roleDescription = roleDescription;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Company getCompany() { return company; }
    public void setCompany(Company company) { this.company = company; }

    public JobRole getJobRole() { return jobRole; }
    public void setJobRole(JobRole jobRole) { this.jobRole = jobRole; }

    public String getDifficultyLevel() { return difficultyLevel; }
    public void setDifficultyLevel(String difficultyLevel) { this.difficultyLevel = difficultyLevel; }

    public String getRoleDescription() { return roleDescription; }
    public void setRoleDescription(String roleDescription) { this.roleDescription = roleDescription; }
}
