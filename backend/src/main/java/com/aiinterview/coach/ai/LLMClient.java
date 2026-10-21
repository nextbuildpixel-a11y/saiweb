package com.aiinterview.coach.ai;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.*;

@Component
public class LLMClient {

    @Value("${app.ai.provider:mock}")
    private String provider;

    @Value("${app.ai.api-key:}")
    private String apiKey;

    @Value("${app.ai.model:gpt-3.5-turbo}")
    private String model;

    @Value("${app.ai.endpoint:https://api.openai.com/v1/chat/completions}")
    private String endpoint;

    @Autowired
    private AnswerEvaluator answerEvaluator;

    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();

    private final ObjectMapper objectMapper = new ObjectMapper();

    public String sendPrompt(String systemPrompt, String userPrompt) throws Exception {
        if ("mock".equalsIgnoreCase(provider) || apiKey == null || apiKey.trim().isEmpty()) {
            return generateMockLLMResponse(systemPrompt, userPrompt);
        }

        try {
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("model", model);
            
            List<Map<String, String>> messages = new ArrayList<>();
            messages.add(Map.of("role", "system", "content", systemPrompt));
            messages.add(Map.of("role", "user", "content", userPrompt));
            requestBody.put("messages", messages);

            String jsonPayload = objectMapper.writeValueAsString(requestBody);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(endpoint))
                    .header("Content-Type", "application/json")
                    .header("Authorization", "Bearer " + apiKey)
                    .POST(HttpRequest.BodyPublishers.ofString(jsonPayload))
                    .timeout(Duration.ofSeconds(15))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() == 200) {
                Map<String, Object> respMap = objectMapper.readValue(response.body(), Map.class);
                List<Map<String, Object>> choices = (List<Map<String, Object>>) respMap.get("choices");
                if (choices != null && !choices.isEmpty()) {
                    Map<String, Object> message = (Map<String, Object>) choices.get(0).get("message");
                    return (String) message.get("content");
                }
            }

            System.err.println("LLM API Returned Status: " + response.statusCode() + ", Body: " + response.body());
            return generateMockLLMResponse(systemPrompt, userPrompt);

        } catch (Exception e) {
            System.err.println("LLM API Network Exception: " + e.getMessage());
            return generateMockLLMResponse(systemPrompt, userPrompt);
        }
    }

    private static class MockQuestionDef {
        final String questionText;
        final String category;
        final String skill;
        final String difficulty;
        final String contextReason;

        MockQuestionDef(String questionText, String category, String skill, String difficulty, String contextReason) {
            this.questionText = questionText;
            this.category = category;
            this.skill = skill;
            this.difficulty = difficulty;
            this.contextReason = contextReason;
        }
    }

    private static final List<MockQuestionDef> MOCK_QUESTION_BANK = List.of(
        new MockQuestionDef(
            "What is the difference between HashMap and ConcurrentHashMap in Java, and how does ConcurrentHashMap achieve thread safety without locking the entire map?",
            "TECHNICAL", "Java", "MEDIUM", "Core Java Concurrency & Data Structures question."
        ),
        new MockQuestionDef(
            "Explain the difference between method overloading and method overriding in Java, and how runtime polymorphism works.",
            "TECHNICAL", "Java", "EASY", "Fundamental OOP & Java concept evaluation."
        ),
        new MockQuestionDef(
            "What is a Database Index, and how does a B-Tree index accelerate SQL query performance?",
            "TECHNICAL", "DBMS", "MEDIUM", "High-frequency Database Optimization question."
        ),
        new MockQuestionDef(
            "Explain the difference between INNER JOIN, LEFT JOIN, and FULL OUTER JOIN in SQL with examples.",
            "TECHNICAL", "SQL", "EASY", "Core SQL relational join operations."
        ),
        new MockQuestionDef(
            "How does Garbage Collection work in Java, and what is the difference between Young, Old, and Metaspace memory generations?",
            "TECHNICAL", "Java", "HARD", "Advanced Java JVM memory management topic."
        ),
        new MockQuestionDef(
            "Compare Array and LinkedList in terms of memory allocation, cache locality, and time complexity for search, insertion, and deletion.",
            "TECHNICAL", "Data Structures", "MEDIUM", "Fundamental Data Structure trade-off analysis."
        ),
        new MockQuestionDef(
            "Explain the ACID properties of a Relational Database, and what constitutes a Dirty Read vs Phantom Read in transaction isolation levels.",
            "TECHNICAL", "DBMS", "HARD", "Advanced Transaction & Concurrency control in databases."
        ),
        new MockQuestionDef(
            "What is the difference between HTTP GET and POST methods, and what makes a REST endpoint idempotent?",
            "TECHNICAL", "Web Services", "EASY", "Web Architecture & API design fundamentals."
        ),
        new MockQuestionDef(
            "Explain the concept of Dependency Injection in Spring Boot and how @Autowired works under the hood.",
            "TECHNICAL", "Spring Boot", "MEDIUM", "Enterprise Java framework dependency management."
        ),
        new MockQuestionDef(
            "How does JWT (JSON Web Token) authentication function in a stateless REST web application architecture?",
            "TECHNICAL", "Security", "MEDIUM", "Modern web security & authentication mechanisms."
        ),
        new MockQuestionDef(
            "What is the difference between a Process and a Thread in Operating Systems, and what occurs during a Context Switch?",
            "TECHNICAL", "Operating Systems", "MEDIUM", "Core Operating System concurrency concepts."
        ),
        new MockQuestionDef(
            "Tell me about a challenging technical bug or problem you encountered in a recent project. How did you troubleshoot and resolve it?",
            "BEHAVIORAL", "Problem Solving", "MEDIUM", "STAR Behavioral diagnostic question assessing troubleshooting."
        ),
        new MockQuestionDef(
            "Describe a situation where you had a conflict or disagreement with a team member. How did you navigate the situation to reach consensus?",
            "BEHAVIORAL", "Teamwork", "EASY", "HR STAR behavioral collaboration evaluation."
        )
    );

    private final java.util.concurrent.atomic.AtomicInteger questionCounter = new java.util.concurrent.atomic.AtomicInteger(0);

    private String generateMockLLMResponse(String systemPrompt, String userPrompt) {
        if (userPrompt.contains("Generate ONE new, relevant, non-repeating interview question")) {
            return generateDynamicQuestion(userPrompt);
        } else if (userPrompt.contains("Generate ONE sharp follow-up question")) {
            return generateDynamicFollowUp(userPrompt);
        } else {
            return generateDynamicAnswerEvaluation(userPrompt);
        }
    }

    private String generateDynamicQuestion(String userPrompt) {
        // Filter out questions previously asked in this session
        List<MockQuestionDef> available = new ArrayList<>();
        for (MockQuestionDef q : MOCK_QUESTION_BANK) {
            if (!userPrompt.contains(q.questionText)) {
                available.add(q);
            }
        }

        MockQuestionDef selected;
        if (!available.isEmpty()) {
            selected = available.get(Math.abs(questionCounter.getAndIncrement()) % available.size());
        } else {
            selected = MOCK_QUESTION_BANK.get(Math.abs(questionCounter.getAndIncrement()) % MOCK_QUESTION_BANK.size());
        }

        try {
            Map<String, String> map = new LinkedHashMap<>();
            map.put("questionText", selected.questionText);
            map.put("category", selected.category);
            map.put("skill", selected.skill);
            map.put("difficulty", selected.difficulty);
            map.put("contextReason", selected.contextReason);
            return objectMapper.writeValueAsString(map);
        } catch (Exception e) {
            return "{\"questionText\":\"" + selected.questionText + "\",\"category\":\"TECHNICAL\",\"skill\":\"Java\",\"difficulty\":\"MEDIUM\",\"contextReason\":\"Verified placement question.\"}";
        }
    }

    private String generateDynamicFollowUp(String userPrompt) {
        String followUpText = "Can you elaborate on the time complexity, edge cases, and architectural trade-offs of your proposed solution?";
        if (userPrompt.contains("HashMap") || userPrompt.contains("ConcurrentHashMap")) {
            followUpText = "How does CAS (Compare-And-Swap) or bin treeifying in Java 8 prevent thread starvation during high concurrency writes?";
        } else if (userPrompt.contains("SQL") || userPrompt.contains("JOIN") || userPrompt.contains("Index")) {
            followUpText = "How would query execution plans and index scan strategies differ as table record volume grows into millions?";
        }

        try {
            Map<String, String> map = new LinkedHashMap<>();
            map.put("questionText", followUpText);
            map.put("category", "FOLLOW_UP");
            map.put("skill", "Deep Dive Technical");
            map.put("difficulty", "ADAPTIVE");
            map.put("contextReason", "Drilling down into candidate response implementation specifics.");
            return objectMapper.writeValueAsString(map);
        } catch (Exception e) {
            return "{\"questionText\":\"" + followUpText + "\",\"category\":\"FOLLOW_UP\",\"skill\":\"Deep Dive\",\"difficulty\":\"ADAPTIVE\",\"contextReason\":\"Follow-up evaluation.\"}";
        }
    }

    private String generateDynamicAnswerEvaluation(String userPrompt) {
        // Extract student answer from user prompt
        String studentAnswer = "";
        int ansIdx = userPrompt.indexOf("Student's Answer:");
        if (ansIdx != -1) {
            int endIdx = userPrompt.indexOf("Expected Core Topics:", ansIdx);
            if (endIdx != -1) {
                studentAnswer = userPrompt.substring(ansIdx + "Student's Answer:".length(), endIdx).trim();
            } else {
                studentAnswer = userPrompt.substring(ansIdx + "Student's Answer:".length()).trim();
            }
        }

        String questionText = "";
        int qIdx = userPrompt.indexOf("Question:");
        if (qIdx != -1) {
            int qEnd = userPrompt.indexOf("Student's Answer:", qIdx);
            if (qEnd != -1) {
                questionText = userPrompt.substring(qIdx + "Question:".length(), qEnd).trim();
            }
        }

        String expectedTopics = "";
        int tIdx = userPrompt.indexOf("Expected Core Topics:");
        if (tIdx != -1) {
            int tEnd = userPrompt.indexOf("Provide a rigorous evaluation", tIdx);
            if (tEnd != -1) {
                expectedTopics = userPrompt.substring(tIdx + "Expected Core Topics:".length(), tEnd).trim();
            }
        }

        if (answerEvaluator != null) {
            Map<String, Object> evalMap = answerEvaluator.evaluateContent(questionText, studentAnswer, expectedTopics);
            try {
                return objectMapper.writeValueAsString(evalMap);
            } catch (Exception e) {
                // Return safe JSON fallback with accurate zero/low score
                Number scoreNum = (Number) evalMap.getOrDefault("overallScore", 15);
                int scoreVal = scoreNum.intValue();
                return "{\"accuracyScore\":" + scoreVal + ",\"overallScore\":" + scoreVal + ",\"technicalScore\":" + scoreVal + ",\"relevanceScore\":" + scoreVal + ",\"communicationScore\":" + scoreVal + ",\"clarityScore\":" + scoreVal + ",\"feedback\":\"" + evalMap.getOrDefault("feedback", "Response evaluated.") + "\",\"strengths\":[],\"areasToImprove\":[\"Review technical specifications\"],\"weaknesses\":[\"Needs greater accuracy\"],\"suggestions\":[\"Practice detailed technical explanations\"]}";
            }
        }

        // Fallback if answerEvaluator is null
        return "{\"accuracyScore\":0,\"overallScore\":0,\"technicalScore\":0,\"relevanceScore\":0,\"communicationScore\":0,\"clarityScore\":0,\"feedback\":\"Evaluation service offline\",\"strengths\":[],\"areasToImprove\":[\"Study technical definitions\"],\"weaknesses\":[\"Service unavailable\"],\"suggestions\":[\"Try again\"]}";
    }

    public String getProvider() { return provider; }
    public String getModel() { return model; }
    public boolean isConfigured() { return apiKey != null && !apiKey.trim().isEmpty(); }
}
