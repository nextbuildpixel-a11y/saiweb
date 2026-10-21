package com.aiinterview.coach.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "answers")
public class Answer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "interview_question_id", nullable = false, unique = true)
    private InterviewQuestion interviewQuestion;

    @Column(name = "answer_text", columnDefinition = "LONGTEXT")
    private String answerText;

    @Column(name = "answer_type")
    private String answerType = "TEXT"; // TEXT, VOICE, VIDEO

    @Column(name = "speaking_duration")
    private Integer speakingDuration; // in seconds

    @Column(name = "audio_file_path")
    private String audioFilePath;

    @Column(name = "video_file_path")
    private String videoFilePath;

    @Column(name = "submitted_at", nullable = false, updatable = false)
    private LocalDateTime submittedAt = LocalDateTime.now();

    public Answer() {}

    @PrePersist
    protected void onCreate() {
        if (submittedAt == null) submittedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public InterviewQuestion getInterviewQuestion() { return interviewQuestion; }
    public void setInterviewQuestion(InterviewQuestion interviewQuestion) { this.interviewQuestion = interviewQuestion; }

    public String getAnswerText() { return answerText; }
    public void setAnswerText(String answerText) { this.answerText = answerText; }

    public String getAnswerType() { return answerType; }
    public void setAnswerType(String answerType) { this.answerType = answerType; }

    public Integer getSpeakingDuration() { return speakingDuration; }
    public void setSpeakingDuration(Integer speakingDuration) { this.speakingDuration = speakingDuration; }

    public String getAudioFilePath() { return audioFilePath; }
    public void setAudioFilePath(String audioFilePath) { this.audioFilePath = audioFilePath; }

    public String getVideoFilePath() { return videoFilePath; }
    public void setVideoFilePath(String videoFilePath) { this.videoFilePath = videoFilePath; }

    public LocalDateTime getSubmittedAt() { return submittedAt; }
    public void setSubmittedAt(LocalDateTime submittedAt) { this.submittedAt = submittedAt; }
}
