package com.aiinterview.coach.ai;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
public class AIExceptionHandler {

    private static final Logger logger = LoggerFactory.getLogger(AIExceptionHandler.class);

    public Map<String, Object> handleAiException(Throwable t, String operation) {
        logger.error("AI API Execution Exception during {}: {}", operation, t.getMessage());

        Map<String, Object> fallback = new HashMap<>();
        fallback.put("isFallback", true);
        fallback.put("status", "FALLBACK_MODE");
        fallback.put("errorMessage", "AI API is temporarily unavailable or unconfigured (" + t.getMessage() + "). Serving verified fallback dataset.");
        
        if ("GENERATE_QUESTION".equalsIgnoreCase(operation)) {
            fallback.put("questionText", "Explain the difference between HashMap and ConcurrentHashMap in Java.");
            fallback.put("category", "TECHNICAL");
            fallback.put("skill", "Java");
            fallback.put("difficulty", "MEDIUM");
            fallback.put("contextReason", "Fallback question for interview continuity.");
        } else if ("EVALUATE_ANSWER".equalsIgnoreCase(operation)) {
            fallback.put("overallScore", 0);
            fallback.put("accuracyScore", 0);
            fallback.put("technicalScore", 0);
            fallback.put("relevanceScore", 0);
            fallback.put("communicationScore", 0);
            fallback.put("clarityScore", 0);
            fallback.put("feedback", "Evaluation service could not process the response. Zero credit awarded.");
            fallback.put("strengths", List.of());
            fallback.put("areasToImprove", List.of("Review the core technical concepts and provide a structured answer."));
            fallback.put("weaknesses", List.of("Evaluation service could not process the response."));
            fallback.put("suggestions", List.of("Review the core technical concepts and provide a structured answer."));
        }

        return fallback;
    }
}
