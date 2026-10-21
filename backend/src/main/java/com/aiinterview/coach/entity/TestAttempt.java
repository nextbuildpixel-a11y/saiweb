package com.aiinterview.coach.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "test_attempts")
public class TestAttempt {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "placement_test_id", nullable = false)
    private PlacementTest placementTest;

    @Column(name = "score_obtained")
    private Double scoreObtained;

    @Column(name = "total_score")
    private Double totalScore;

    private String status; // PASSED, FAILED, IN_PROGRESS

    @Column(name = "attempted_at", nullable = false, updatable = false)
    private LocalDateTime attemptedAt = LocalDateTime.now();

    public TestAttempt() {}

    @PrePersist
    protected void onCreate() {
        if (attemptedAt == null) attemptedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public PlacementTest getPlacementTest() { return placementTest; }
    public void setPlacementTest(PlacementTest placementTest) { this.placementTest = placementTest; }

    public Double getScoreObtained() { return scoreObtained; }
    public void setScoreObtained(Double scoreObtained) { this.scoreObtained = scoreObtained; }

    public Double getTotalScore() { return totalScore; }
    public void setTotalScore(Double totalScore) { this.totalScore = totalScore; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getAttemptedAt() { return attemptedAt; }
    public void setAttemptedAt(LocalDateTime attemptedAt) { this.attemptedAt = attemptedAt; }
}
