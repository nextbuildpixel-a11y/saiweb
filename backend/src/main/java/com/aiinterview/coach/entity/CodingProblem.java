package com.aiinterview.coach.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "coding_problems")
public class CodingProblem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(name = "description_text", columnDefinition = "LONGTEXT")
    private String descriptionText;

    private String difficulty; // Easy, Medium, Hard

    private String topic; // Arrays, Strings, Trees, Graphs, DP

    @Column(name = "constraints_text", columnDefinition = "TEXT")
    private String constraintsText;

    @Column(name = "sample_input", columnDefinition = "TEXT")
    private String sampleInput;

    @Column(name = "sample_output", columnDefinition = "TEXT")
    private String sampleOutput;

    @Column(name = "expected_complexity")
    private String expectedComplexity;

    @Column(name = "test_data_json", columnDefinition = "LONGTEXT")
    private String testDataJson;

    public CodingProblem() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescriptionText() { return descriptionText; }
    public void setDescriptionText(String descriptionText) { this.descriptionText = descriptionText; }

    public String getDifficulty() { return difficulty; }
    public void setDifficulty(String difficulty) { this.difficulty = difficulty; }

    public String getTopic() { return topic; }
    public void setTopic(String topic) { this.topic = topic; }

    public String getConstraintsText() { return constraintsText; }
    public void setConstraintsText(String constraintsText) { this.constraintsText = constraintsText; }

    public String getSampleInput() { return sampleInput; }
    public void setSampleInput(String sampleInput) { this.sampleInput = sampleInput; }

    public String getSampleOutput() { return sampleOutput; }
    public void setSampleOutput(String sampleOutput) { this.sampleOutput = sampleOutput; }

    public String getExpectedComplexity() { return expectedComplexity; }
    public void setExpectedComplexity(String expectedComplexity) { this.expectedComplexity = expectedComplexity; }

    public String getTestDataJson() { return testDataJson; }
    public void setTestDataJson(String testDataJson) { this.testDataJson = testDataJson; }
}
