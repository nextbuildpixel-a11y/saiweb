package com.aiinterview.coach.controller;

import com.aiinterview.coach.ai.AIService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ai/test")
public class AiTestController {

    @Autowired
    private AIService aiService;

    @GetMapping("/config")
    public ResponseEntity<?> getAiConfig() {
        return ResponseEntity.ok(aiService.getAiConfigStatus());
    }

    @PostMapping("/generate-question")
    public ResponseEntity<?> testGenerateQuestion(@RequestBody Map<String, Object> body) {
        String companyName = (String) body.get("companyName");
        String roleTitle = (String) body.get("roleTitle");
        List<String> requiredSkills = (List<String>) body.get("requiredSkills");
        String difficulty = (String) body.get("difficulty");
        String interviewType = (String) body.get("interviewType");
        List<String> previousQuestions = (List<String>) body.get("previousQuestions");

        Map<String, Object> result = aiService.generateInterviewQuestion(
                companyName, roleTitle, requiredSkills, difficulty, interviewType, previousQuestions
        );

        return ResponseEntity.ok(result);
    }

    @PostMapping("/evaluate-answer")
    public ResponseEntity<?> testEvaluateAnswer(@RequestBody Map<String, Object> body) {
        String questionText = (String) body.get("questionText");
        String studentAnswer = (String) body.get("studentAnswer");
        String expectedTopics = (String) body.get("expectedTopics");

        Map<String, Object> result = aiService.evaluateAnswer(questionText, studentAnswer, expectedTopics);
        return ResponseEntity.ok(result);
    }
}
