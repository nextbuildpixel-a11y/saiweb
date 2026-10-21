package com.aiinterview.coach.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "interview_questions")
public class InterviewQuestion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "interview_id", nullable = false)
    private Interview interview;

    @Column(name = "question_text", columnDefinition = "LONGTEXT", nullable = false)
    private String questionText;

    private String category; // TECHNICAL, BEHAVIORAL, HR, FOLLOW_UP

    @Column(name = "skill_name")
    private String skillName;

    private String difficulty; // EASY, MEDIUM, HARD

    @Column(name = "question_order")
    private Integer questionOrder;

    @Column(name = "is_follow_up")
    private Boolean isFollowUp = false;

    @Column(name = "parent_question_id")
    private Long parentQuestionId;

    public InterviewQuestion() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Interview getInterview() { return interview; }
    public void setInterview(Interview interview) { this.interview = interview; }

    public String getQuestionText() { return questionText; }
    public void setQuestionText(String questionText) { this.questionText = questionText; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getSkillName() { return skillName; }
    public void setSkillName(String skillName) { this.skillName = skillName; }

    public String getDifficulty() { return difficulty; }
    public void setDifficulty(String difficulty) { this.difficulty = difficulty; }

    public Integer getQuestionOrder() { return questionOrder; }
    public void setQuestionOrder(Integer questionOrder) { this.questionOrder = questionOrder; }

    public Boolean getIsFollowUp() { return isFollowUp; }
    public void setIsFollowUp(Boolean isFollowUp) { this.isFollowUp = isFollowUp; }

    public Long getParentQuestionId() { return parentQuestionId; }
    public void setParentQuestionId(Long parentQuestionId) { this.parentQuestionId = parentQuestionId; }
}
