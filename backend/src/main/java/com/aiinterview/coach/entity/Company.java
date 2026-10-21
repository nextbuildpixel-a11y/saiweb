package com.aiinterview.coach.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "companies")
public class Company {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String industry;
    private String website;

    @Column(name = "public_prep_info", columnDefinition = "LONGTEXT")
    private String publicPrepInfo;

    @Column(nullable = false)
    private boolean status = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public Company() {}

    public Company(String name, String description, String industry, String website, String publicPrepInfo) {
        this.name = name;
        this.description = description;
        this.industry = industry;
        this.website = website;
        this.publicPrepInfo = publicPrepInfo;
        this.status = true;
    }

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getIndustry() { return industry; }
    public void setIndustry(String industry) { this.industry = industry; }

    public String getWebsite() { return website; }
    public void setWebsite(String website) { this.website = website; }

    public String getPublicPrepInfo() { return publicPrepInfo; }
    public void setPublicPrepInfo(String publicPrepInfo) { this.publicPrepInfo = publicPrepInfo; }

    public boolean isStatus() { return status; }
    public void setStatus(boolean status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
