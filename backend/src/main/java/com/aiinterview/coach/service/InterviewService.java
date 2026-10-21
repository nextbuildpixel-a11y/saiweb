package com.aiinterview.coach.service;

import com.aiinterview.coach.ai.AIService;
import com.aiinterview.coach.entity.*;
import com.aiinterview.coach.repository.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class InterviewService {

    @Autowired
    private InterviewRepository interviewRepository;

    @Autowired
    private InterviewQuestionRepository interviewQuestionRepository;

    @Autowired
    private AnswerRepository answerRepository;

    @Autowired
    private EvaluationRepository evaluationRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CompanyRepository companyRepository;

    @Autowired
    private JobRoleRepository jobRoleRepository;

    @Autowired
    private QuestionHistoryService questionHistoryService;

    @Autowired
    private AdaptiveEngineService adaptiveEngineService;

    @Autowired
    private AIService aiService;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Transactional
    public Interview createInterview(
            Long companyId,
            Long jobRoleId,
            String mode,
            String interviewType,
            String difficulty,
            Integer totalQuestions,
            boolean useResume,
            boolean useJd,
            String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Student user not found"));

        Company company = companyId != null ? companyRepository.findById(companyId).orElse(null) : null;
        JobRole jobRole = jobRoleId != null ? jobRoleRepository.findById(jobRoleId).orElse(null) : null;

        Interview interview = new Interview();
        interview.setUser(user);
        interview.setCompany(company);
        interview.setJobRole(jobRole);
        interview.setMode(mode != null ? mode : "Text");
        interview.setInterviewType(interviewType != null ? interviewType : "Technical");
        interview.setDifficulty(difficulty != null ? difficulty : "MEDIUM");
        interview.setTotalQuestions(totalQuestions != null ? totalQuestions : 3);
        interview.setStatus("IN_PROGRESS");
        interview.setCurrentQuestionIndex(0);
        interview.setStartedAt(LocalDateTime.now());

        return interviewRepository.save(interview);
    }

    @Transactional
    public Map<String, Object> getCurrentQuestion(Long interviewId, String email) throws Exception {
        Interview interview = validateInterviewOwnership(interviewId, email);

        if ("COMPLETED".equalsIgnoreCase(interview.getStatus())) {
            throw new IllegalStateException("Interview has already been completed.");
        }

        List<InterviewQuestion> existingQuestions = interviewQuestionRepository.findByInterviewIdOrderByQuestionOrderAsc(interview.getId());
        int currentIndex = interview.getCurrentQuestionIndex();

        if (currentIndex < existingQuestions.size()) {
            InterviewQuestion q = existingQuestions.get(currentIndex);
            Map<String, Object> resp = new HashMap<>();
            resp.put("interviewId", interview.getId());
            resp.put("questionId", q.getId());
            resp.put("questionOrder", q.getQuestionOrder());
            resp.put("totalQuestions", interview.getTotalQuestions());
            resp.put("questionText", q.getQuestionText());
            resp.put("skill", q.getCategory());
            resp.put("difficulty", q.getDifficulty() != null ? q.getDifficulty() : interview.getDifficulty());
            resp.put("mode", interview.getMode());
            resp.put("isFollowUp", q.getIsFollowUp());
            resp.put("companyName", interview.getCompany() != null ? interview.getCompany().getName() : "General Practice");
            resp.put("roleTitle", interview.getJobRole() != null ? interview.getJobRole().getTitle() : "Software Engineer");
            return resp;
        }

        // Fetch previous evaluations for adaptive difficulty calculations
        List<Evaluation> previousEvals = new ArrayList<>();
        for (InterviewQuestion q : existingQuestions) {
            Optional<Answer> ansOpt = answerRepository.findByInterviewQuestionId(q.getId());
            if (ansOpt.isPresent()) {
                Optional<Evaluation> evalOpt = evaluationRepository.findByAnswerId(ansOpt.get().getId());
                evalOpt.ifPresent(previousEvals::add);
            }
        }

        // Generate ADAPTIVE non-repeating question using AdaptiveEngineService
        Map<String, Object> aiGen = adaptiveEngineService.generateAdaptiveQuestion(
                interview, existingQuestions, previousEvals
        );

        InterviewQuestion iq = new InterviewQuestion();
        iq.setInterview(interview);
        iq.setQuestionText((String) aiGen.get("questionText"));
        iq.setCategory((String) aiGen.getOrDefault("skill", "Technical"));
        iq.setSkillName((String) aiGen.getOrDefault("skill", "Technical"));
        iq.setDifficulty((String) aiGen.getOrDefault("adaptedDifficulty", interview.getDifficulty()));
        iq.setQuestionOrder(currentIndex + 1);
        iq.setIsFollowUp(Boolean.TRUE.equals(aiGen.get("isFollowUp")));
        if (aiGen.get("parentQuestionId") != null) {
            iq.setParentQuestionId(((Number) aiGen.get("parentQuestionId")).longValue());
        }

        InterviewQuestion savedIq = interviewQuestionRepository.save(iq);

        // Record in student question history for anti-duplication
        questionHistoryService.recordQuestionHistory(interview.getUser(), interview, savedIq.getQuestionText());

        Map<String, Object> resp = new HashMap<>();
        resp.put("interviewId", interview.getId());
        resp.put("questionId", savedIq.getId());
        resp.put("questionOrder", savedIq.getQuestionOrder());
        resp.put("totalQuestions", interview.getTotalQuestions());
        resp.put("questionText", savedIq.getQuestionText());
        resp.put("skill", savedIq.getCategory());
        resp.put("difficulty", savedIq.getDifficulty());
        resp.put("mode", interview.getMode());
        resp.put("isFollowUp", savedIq.getIsFollowUp());
        resp.put("companyName", interview.getCompany() != null ? interview.getCompany().getName() : "General Practice");
        resp.put("roleTitle", interview.getJobRole() != null ? interview.getJobRole().getTitle() : "Software Engineer");
        resp.put("isFallback", aiGen.getOrDefault("isFallback", false));

        return resp;
    }

    @Transactional
    public Map<String, Object> submitAnswer(
            Long interviewId,
            String answerText,
            String answerType,
            Integer speakingDuration,
            String audioFilePath,
            String videoFilePath,
            String email) throws Exception {

        Interview interview = validateInterviewOwnership(interviewId, email);

        if (!"IN_PROGRESS".equalsIgnoreCase(interview.getStatus())) {
            throw new IllegalStateException("Interview is not active for answer submission.");
        }

        List<InterviewQuestion> questions = interviewQuestionRepository.findByInterviewIdOrderByQuestionOrderAsc(interview.getId());
        int currentIndex = interview.getCurrentQuestionIndex();

        if (currentIndex >= questions.size()) {
            throw new IllegalStateException("No active question to answer.");
        }

        InterviewQuestion currentQuestion = questions.get(currentIndex);

        // Prevent duplicate submissions for the same question
        Optional<Answer> existingAnswerOpt = answerRepository.findByInterviewQuestionId(currentQuestion.getId());
        if (existingAnswerOpt.isPresent()) {
            throw new IllegalStateException("Answer has already been submitted for this question.");
        }

        Answer answer = new Answer();
        answer.setInterviewQuestion(currentQuestion);
        answer.setAnswerText(answerText != null ? answerText : "");
        answer.setAnswerType(answerType != null ? answerType : "TEXT");
        answer.setSpeakingDuration(speakingDuration);
        answer.setAudioFilePath(audioFilePath);
        answer.setVideoFilePath(videoFilePath);
        answer.setSubmittedAt(LocalDateTime.now());
        Answer savedAnswer = answerRepository.save(answer);

        // Evaluate answer using AIService
        Map<String, Object> evalMap = aiService.evaluateAnswer(
                currentQuestion.getQuestionText(),
                answerText,
                currentQuestion.getCategory()
        );

        Evaluation eval = new Evaluation();
        eval.setAnswer(savedAnswer);
        eval.setOverallScore(((Number) evalMap.get("overallScore")).doubleValue());
        eval.setTechnicalScore(((Number) evalMap.get("technicalScore")).doubleValue());
        eval.setRelevanceScore(((Number) evalMap.get("relevanceScore")).doubleValue());
        eval.setCommunicationScore(((Number) evalMap.get("communicationScore")).doubleValue());
        eval.setClarityScore(((Number) evalMap.get("clarityScore")).doubleValue());
        eval.setEvaluationJson(objectMapper.writeValueAsString(evalMap));

        Evaluation savedEval = evaluationRepository.save(eval);

        // Increment current question index
        int nextIndex = currentIndex + 1;
        interview.setCurrentQuestionIndex(nextIndex);
        boolean isFinished = nextIndex >= interview.getTotalQuestions();

        if (isFinished) {
            completeInterviewInternal(interview);
        } else {
            interviewRepository.save(interview);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("answerId", savedAnswer.getId());
        response.put("answerType", savedAnswer.getAnswerType());
        response.put("speakingDuration", savedAnswer.getSpeakingDuration());
        response.put("videoFilePath", savedAnswer.getVideoFilePath());
        response.put("overallScore", savedEval.getOverallScore());
        response.put("technicalScore", savedEval.getTechnicalScore());
        response.put("communicationScore", savedEval.getCommunicationScore());
        
        Number accScore = (Number) evalMap.getOrDefault("accuracyScore", evalMap.getOrDefault("technicalScore", savedEval.getOverallScore()));
        response.put("accuracyScore", accScore);
        response.put("score", accScore);
        response.put("feedback", evalMap.getOrDefault("feedback", ""));
        response.put("strengths", evalMap.getOrDefault("strengths", Collections.emptyList()));
        response.put("areasToImprove", evalMap.getOrDefault("areasToImprove", Collections.emptyList()));

        response.put("evaluation", evalMap);
        response.put("isFinished", isFinished);
        response.put("nextQuestionIndex", nextIndex);

        return response;
    }

    @Transactional
    public Map<String, Object> completeInterview(Long interviewId, String email) {
        Interview interview = validateInterviewOwnership(interviewId, email);
        return completeInterviewInternal(interview);
    }

    private Map<String, Object> completeInterviewInternal(Interview interview) {
        interview.setStatus("COMPLETED");
        interview.setCompletedAt(LocalDateTime.now());

        // Calculate average score across all answered questions
        List<InterviewQuestion> questions = interviewQuestionRepository.findByInterviewIdOrderByQuestionOrderAsc(interview.getId());
        double totalScoreSum = 0;
        int count = 0;

        for (InterviewQuestion q : questions) {
            Optional<Answer> ansOpt = answerRepository.findByInterviewQuestionId(q.getId());
            if (ansOpt.isPresent()) {
                Optional<Evaluation> evalOpt = evaluationRepository.findByAnswerId(ansOpt.get().getId());
                if (evalOpt.isPresent()) {
                    totalScoreSum += evalOpt.get().getOverallScore();
                    count++;
                }
            }
        }

        double finalScore = count > 0 ? Math.round((totalScoreSum / count) * 10.0) / 10.0 : 0.0;
        interview.setFinalScore(finalScore);
        interviewRepository.save(interview);

        Map<String, Object> result = new HashMap<>();
        result.put("interviewId", interview.getId());
        result.put("status", "COMPLETED");
        result.put("finalScore", finalScore);
        result.put("completedAt", interview.getCompletedAt());
        result.put("questionsCount", count);

        return result;
    }

    public Map<String, Object> getInterviewResult(Long interviewId, String email) throws Exception {
        Interview interview = validateInterviewOwnership(interviewId, email);

        Map<String, Object> result = new HashMap<>();
        result.put("interviewId", interview.getId());
        result.put("companyName", interview.getCompany() != null ? interview.getCompany().getName() : "General Practice");
        result.put("roleTitle", interview.getJobRole() != null ? interview.getJobRole().getTitle() : "Software Engineer");
        result.put("mode", interview.getMode());
        result.put("finalScore", interview.getFinalScore() != null ? interview.getFinalScore() : 0.0);
        result.put("startedAt", interview.getStartedAt());
        result.put("completedAt", interview.getCompletedAt());

        List<InterviewQuestion> questions = interviewQuestionRepository.findByInterviewIdOrderByQuestionOrderAsc(interview.getId());
        List<Map<String, Object>> qaList = new ArrayList<>();

        for (InterviewQuestion q : questions) {
            Map<String, Object> qa = new HashMap<>();
            qa.put("questionId", q.getId());
            qa.put("questionText", q.getQuestionText());
            qa.put("category", q.getCategory());
            qa.put("difficulty", q.getDifficulty());
            qa.put("isFollowUp", q.getIsFollowUp());

            Optional<Answer> ansOpt = answerRepository.findByInterviewQuestionId(q.getId());
            if (ansOpt.isPresent()) {
                Answer ans = ansOpt.get();
                qa.put("answerText", ans.getAnswerText());
                qa.put("answerType", ans.getAnswerType());
                qa.put("speakingDuration", ans.getSpeakingDuration());
                qa.put("videoFilePath", ans.getVideoFilePath());

                Optional<Evaluation> evalOpt = evaluationRepository.findByAnswerId(ans.getId());
                if (evalOpt.isPresent()) {
                    Evaluation eval = evalOpt.get();
                    qa.put("overallScore", eval.getOverallScore());
                    qa.put("technicalScore", eval.getTechnicalScore());
                    qa.put("communicationScore", eval.getCommunicationScore());
                    if (eval.getEvaluationJson() != null) {
                        qa.put("evalDetails", objectMapper.readValue(eval.getEvaluationJson(), Map.class));
                    }
                }
            }
            qaList.add(qa);
        }

        result.put("questions", qaList);

        return result;
    }

    private Interview validateInterviewOwnership(Long interviewId, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Student user not found"));

        Interview interview = interviewRepository.findById(interviewId)
                .orElseThrow(() -> new RuntimeException("Interview session not found"));

        if (!interview.getUser().getId().equals(user.getId())) {
            throw new SecurityException("Unauthorized access to interview session");
        }

        return interview;
    }

    public List<Map<String, Object>> getInterviewHistory(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Student user not found"));

        List<Interview> interviews = interviewRepository.findByUserIdOrderByStartedAtDesc(user.getId());
        List<Map<String, Object>> list = new ArrayList<>();

        for (Interview i : interviews) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", i.getId());
            map.put("companyName", i.getCompany() != null ? i.getCompany().getName() : "Enterprise Mock");
            map.put("roleTitle", i.getJobRole() != null ? i.getJobRole().getTitle() : "Software Engineer");
            map.put("mode", i.getMode() != null ? i.getMode() : "TEXT");
            map.put("interviewType", i.getInterviewType() != null ? i.getInterviewType() : "Technical");
            map.put("overallScore", i.getFinalScore() != null ? i.getFinalScore() : 80.0);
            map.put("startedAt", i.getStartedAt());
            map.put("status", i.getStatus());
            list.add(map);
        }

        return list;
    }
}
