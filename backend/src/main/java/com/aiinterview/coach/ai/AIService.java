package com.aiinterview.coach.ai;

import com.aiinterview.coach.entity.Question;
import com.aiinterview.coach.repository.QuestionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class AIService {

    @Autowired
    private LLMClient llmClient;

    @Autowired
    private AIResponseValidator responseValidator;

    @Autowired
    private AIExceptionHandler exceptionHandler;

    @Autowired
    private AnswerEvaluator answerEvaluator;

    @Autowired
    private QuestionRepository questionRepository;

    public Map<String, Object> generateInterviewQuestion(
            String companyName,
            String roleTitle,
            List<String> requiredSkills,
            String difficulty,
            String interviewType,
            List<String> previousQuestions) {

        String systemPrompt = "You are a professional AI Interviewer. Output strict valid JSON only.";
        String userPrompt = PromptTemplates.getQuestionGenerationPrompt(
                companyName, roleTitle, requiredSkills, difficulty, interviewType, previousQuestions
        );

        try {
            String rawResponse = llmClient.sendPrompt(systemPrompt, userPrompt);
            Map<String, Object> parsed = responseValidator.validateAndParseJson(rawResponse);
            parsed.put("isFallback", !llmClient.isConfigured());
            return parsed;
        } catch (Exception e) {
            Map<String, Object> fallback = exceptionHandler.handleAiException(e, "GENERATE_QUESTION");
            enrichWithDatabaseFallback(fallback, companyName, difficulty);
            return fallback;
        }
    }

    public Map<String, Object> generateFollowUpQuestion(String previousQuestion, String studentAnswer, String interviewContext) {
        String systemPrompt = "You are a senior technical interviewer. Output strict valid JSON only.";
        String userPrompt = PromptTemplates.getFollowUpQuestionPrompt(previousQuestion, studentAnswer, interviewContext);

        try {
            String rawResponse = llmClient.sendPrompt(systemPrompt, userPrompt);
            Map<String, Object> parsed = responseValidator.validateAndParseJson(rawResponse);
            parsed.put("isFallback", !llmClient.isConfigured());
            return parsed;
        } catch (Exception e) {
            return exceptionHandler.handleAiException(e, "GENERATE_FOLLOW_UP");
        }
    }

    public Map<String, Object> evaluateAnswer(String questionText, String studentAnswer, String expectedTopics) {
        // Enforce strict zero evaluation for unanswered, 'I don't know', gibberish, or unrelated responses
        AnswerEvaluator.EvaluationCheckResult checkResult = answerEvaluator.checkResponse(questionText, studentAnswer, expectedTopics);
        if (checkResult.isZeroScore()) {
            return answerEvaluator.buildZeroEvaluationMap(checkResult);
        }

        String systemPrompt = "You are an AI answer evaluation engine. Output strict valid JSON only.";
        String userPrompt = PromptTemplates.getAnswerEvaluationPrompt(questionText, studentAnswer, expectedTopics);

        try {
            String rawResponse = llmClient.sendPrompt(systemPrompt, userPrompt);
            Map<String, Object> parsed = responseValidator.validateAndParseJson(rawResponse);
            parsed.put("isFallback", !llmClient.isConfigured());
            return parsed;
        } catch (Exception e) {
            return exceptionHandler.handleAiException(e, "EVALUATE_ANSWER");
        }
    }

    private void enrichWithDatabaseFallback(Map<String, Object> fallback, String companyName, String difficulty) {
        List<Question> list = questionRepository.findAll();
        if (!list.isEmpty()) {
            Question q = list.get(new Random().nextInt(list.size()));
            fallback.put("questionText", q.getQuestionText());
            fallback.put("skill", q.getSkillName() != null ? q.getSkillName() : "Technical");
            fallback.put("category", q.getCategory() != null ? q.getCategory() : "TECHNICAL");
            fallback.put("difficulty", q.getDifficulty() != null ? q.getDifficulty() : "MEDIUM");
            fallback.put("contextReason", "Served from verified database question bank.");
        }
    }

    public Map<String, Object> getAiConfigStatus() {
        Map<String, Object> map = new HashMap<>();
        map.put("provider", llmClient.getProvider());
        map.put("model", llmClient.getModel());
        map.put("isConfigured", llmClient.isConfigured());
        map.put("status", llmClient.isConfigured() ? "EXTERNAL_AI_ACTIVE" : "MOCK_FALLBACK_ACTIVE");
        return map;
    }
}
