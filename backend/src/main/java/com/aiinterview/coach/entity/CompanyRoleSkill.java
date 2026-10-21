package com.aiinterview.coach.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "company_role_skills")
public class CompanyRoleSkill {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_role_id", nullable = false)
    private CompanyRole companyRole;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "skill_id", nullable = false)
    private Skill skill;

    private String importance; // HIGH, MEDIUM, LOW

    @Column(name = "required_level")
    private String requiredLevel; // BEGINNER, INTERMEDIATE, ADVANCED

    public CompanyRoleSkill() {}

    public CompanyRoleSkill(CompanyRole companyRole, Skill skill, String importance, String requiredLevel) {
        this.companyRole = companyRole;
        this.skill = skill;
        this.importance = importance;
        this.requiredLevel = requiredLevel;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public CompanyRole getCompanyRole() { return companyRole; }
    public void setCompanyRole(CompanyRole companyRole) { this.companyRole = companyRole; }

    public Skill getSkill() { return skill; }
    public void setSkill(Skill skill) { this.skill = skill; }

    public String getImportance() { return importance; }
    public void setImportance(String importance) { this.importance = importance; }

    public String getRequiredLevel() { return requiredLevel; }
    public void setRequiredLevel(String requiredLevel) { this.requiredLevel = requiredLevel; }
}
