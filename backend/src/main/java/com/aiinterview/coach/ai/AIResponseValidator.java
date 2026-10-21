package com.aiinterview.coach.ai;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
public class AIResponseValidator {

    private final ObjectMapper objectMapper = new ObjectMapper();

    public Map<String, Object> validateAndParseJson(String rawResponse) {
        if (rawResponse == null || rawResponse.trim().isEmpty()) {
            throw new IllegalArgumentException("Empty response from LLM API");
        }

        String cleaned = cleanJsonString(rawResponse);

        try {
            return objectMapper.readValue(cleaned, Map.class);
        } catch (Exception e) {
            System.err.println("JSON parse exception, attempting repair: " + e.getMessage());
            return repairQuestionJson(rawResponse);
        }
    }

    private String cleanJsonString(String input) {
        String str = input.trim();
        if (str.startsWith("```json")) {
            str = str.substring(7);
        } else if (str.startsWith("```")) {
            str = str.substring(3);
        }
        if (str.endsWith("```")) {
            str = str.substring(0, str.length() - 3);
        }
        return str.trim();
    }

    private Map<String, Object> repairQuestionJson(String rawText) {
        Map<String, Object> map = new HashMap<>();
        map.put("questionText", rawText != null ? rawText.replaceAll("[{}\"\\[\\]]", "").trim() : "What are the core concepts of Java OOP?");
        map.put("category", "TECHNICAL");
        map.put("skill", "Java");
        map.put("difficulty", "MEDIUM");
        map.put("contextReason", "Repaired fallback format for technical evaluation");
        return map;
    }
}
