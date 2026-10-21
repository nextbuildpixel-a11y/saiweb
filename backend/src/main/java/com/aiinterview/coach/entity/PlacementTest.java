package com.aiinterview.coach.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "placement_tests")
public class PlacementTest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    @Column(name = "round_type")
    private String roundType; // APTITUDE, TECHNICAL_MCQ

    @Column(name = "duration_minutes")
    private Integer durationMinutes;

    @Column(name = "total_marks")
    private Integer totalMarks;

    public PlacementTest() {}

    public PlacementTest(String title, String roundType, Integer durationMinutes, Integer totalMarks) {
        this.title = title;
        this.roundType = roundType;
        this.durationMinutes = durationMinutes;
        this.totalMarks = totalMarks;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getRoundType() { return roundType; }
    public void setRoundType(String roundType) { this.roundType = roundType; }

    public Integer getDurationMinutes() { return durationMinutes; }
    public void setDurationMinutes(Integer durationMinutes) { this.durationMinutes = durationMinutes; }

    public Integer getTotalMarks() { return totalMarks; }
    public void setTotalMarks(Integer totalMarks) { this.totalMarks = totalMarks; }
}
