package com.aiinterview.coach.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "questions")
public class Question {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "question_text", nullable = false, columnDefinition = "TEXT")
    private String questionText;

    private String category; // TECHNICAL, HR, BEHAVIORAL, CODING, APTITUDE
    
    @Column(name = "skill_name")
    private String skillName;

    private String difficulty; // EASY, MEDIUM, HARD

    @Column(name = "interview_type")
    private String interviewType;

    public Question() {}

    public Question(String questionText, String category, String skillName, String difficulty, String interviewType) {
        this.questionText = questionText;
        this.category = category;
        this.skillName = skillName;
        this.difficulty = difficulty;
        this.interviewType = interviewType;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getQuestionText() { return questionText; }
    public void setQuestionText(String questionText) { this.questionText = questionText; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getSkillName() { return skillName; }
    public void setSkillName(String skillName) { this.skillName = skillName; }

    public String getDifficulty() { return difficulty; }
    public void setDifficulty(String difficulty) { this.difficulty = difficulty; }

    public String getInterviewType() { return interviewType; }
    public void setInterviewType(String interviewType) { this.interviewType = interviewType; }
}
