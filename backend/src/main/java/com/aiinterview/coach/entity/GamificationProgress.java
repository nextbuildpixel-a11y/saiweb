package com.aiinterview.coach.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "gamification_progress")
public class GamificationProgress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "xp_points")
    private Integer xpPoints = 0;

    private Integer level = 1;

    @Column(name = "streak_days")
    private Integer streakDays = 0;

    @Column(name = "badges_json", columnDefinition = "TEXT")
    private String badgesJson;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();

    public GamificationProgress() {}

    public GamificationProgress(User user) {
        this.user = user;
        this.xpPoints = 100;
        this.level = 1;
        this.streakDays = 1;
        this.badgesJson = "[\"FIRST_INTERVIEW\"]";
        this.updatedAt = LocalDateTime.now();
    }

    @PrePersist
    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public Integer getXpPoints() { return xpPoints; }
    public void setXpPoints(Integer xpPoints) { this.xpPoints = xpPoints; }

    public Integer getLevel() { return level; }
    public void setLevel(Integer level) { this.level = level; }

    public Integer getStreakDays() { return streakDays; }
    public void setStreakDays(Integer streakDays) { this.streakDays = streakDays; }

    public String getBadgesJson() { return badgesJson; }
    public void setBadgesJson(String badgesJson) { this.badgesJson = badgesJson; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
