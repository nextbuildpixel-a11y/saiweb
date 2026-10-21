package com.aiinterview.coach.ai;

import java.util.List;

public class PromptTemplates {

    public static String getQuestionGenerationPrompt(
            String companyName,
            String roleTitle,
            List<String> requiredSkills,
            String difficulty,
            String interviewType,
            List<String> previousQuestions) {

        StringBuilder sb = new StringBuilder();
        sb.append("You are an expert technical interviewer conducting a mock placement interview.\n");
        sb.append("Target Company: ").append(companyName != null ? companyName : "General Tech Enterprise").append("\n");
        sb.append("Target Job Role: ").append(roleTitle != null ? roleTitle : "Software Engineer").append("\n");
        sb.append("Target Skills: ").append(requiredSkills != null ? String.join(", ", requiredSkills) : "Java, Data Structures, Problem Solving").append("\n");
        sb.append("Interview Mode: ").append(interviewType != null ? interviewType : "Technical").append("\n");
        sb.append("Target Difficulty: ").append(difficulty != null ? difficulty : "MEDIUM").append("\n");
        
        if (previousQuestions != null && !previousQuestions.isEmpty()) {
            sb.append("Previously Asked Questions (DO NOT REPEAT): ").append(String.join("; ", previousQuestions)).append("\n");
        }

        sb.append("\nGenerate ONE new, relevant, non-repeating interview question in strict JSON format:\n");
        sb.append("{\n");
        sb.append("  \"questionText\": \"Exact question text...\",\n");
        sb.append("  \"category\": \"TECHNICAL\",\n");
        sb.append("  \"skill\": \"Primary skill evaluated\",\n");
        sb.append("  \"difficulty\": \"").append(difficulty != null ? difficulty : "MEDIUM").append("\",\n");
        sb.append("  \"contextReason\": \"Why this question is relevant for ").append(companyName != null ? companyName : "this role").append("\"\n");
        sb.append("}\n");

        return sb.toString();
    }

    public static String getFollowUpQuestionPrompt(String previousQuestion, String studentAnswer, String interviewContext) {
        StringBuilder sb = new StringBuilder();
        sb.append("You are an interviewer conducting an interactive follow-up question evaluation.\n");
        sb.append("Previous Question Asked: ").append(previousQuestion).append("\n");
        sb.append("Candidate Response: ").append(studentAnswer).append("\n");
        sb.append("Context: ").append(interviewContext != null ? interviewContext : "Technical Interview").append("\n");

        sb.append("\nGenerate ONE sharp follow-up question digging deeper into the candidate's answer in strict JSON format:\n");
        sb.append("{\n");
        sb.append("  \"questionText\": \"Follow-up question text...\",\n");
        sb.append("  \"category\": \"FOLLOW_UP\",\n");
        sb.append("  \"skill\": \"Deep dive skill\",\n");
        sb.append("  \"difficulty\": \"ADAPTIVE\",\n");
        sb.append("  \"contextReason\": \"Drilling down on specific point in candidate's response\"\n");
        sb.append("}\n");

        return sb.toString();
    }

    public static String getAnswerEvaluationPrompt(String questionText, String studentAnswer, String expectedTopics) {
        StringBuilder sb = new StringBuilder();
        sb.append("You are an expert technical interviewer conducting an objective placement interview evaluation.\n");
        sb.append("Question: ").append(questionText).append("\n");
        sb.append("Student's Answer: ").append(studentAnswer).append("\n");
        sb.append("Expected Core Topics: ").append(expectedTopics != null ? expectedTopics : "Technical accuracy, core mechanisms, clarity").append("\n");
        sb.append("\nCRITICAL OBJECTIVE SCORING RULES:\n");
        sb.append("1. Factual Correctness: Verify if technical statements are objectively true. If the candidate makes factually false claims (e.g., claiming HashMap is thread-safe), heavily penalize the technicalScore and accuracyScore.\n");
        sb.append("2. Relevance: Directly assess whether the response answers the question asked.\n");
        sb.append("3. Strict Score Scaling:\n");
        sb.append("   - 0 to 20: Completely incorrect, factually wrong, unrelated, gibberish, or blank/don't know.\n");
        sb.append("   - 40 to 60: Partially correct, superficial, misses core mechanism, or has minor misconceptions.\n");
        sb.append("   - 80 to 100: Comprehensive, factually accurate, explains mechanisms and trade-offs clearly.\n");
        sb.append("4. Output MUST be valid JSON only without markdown formatting:\n");
        sb.append("{\n");
        sb.append("  \"accuracyScore\": 0,\n");
        sb.append("  \"overallScore\": 0,\n");
        sb.append("  \"technicalScore\": 0,\n");
        sb.append("  \"relevanceScore\": 0,\n");
        sb.append("  \"communicationScore\": 0,\n");
        sb.append("  \"clarityScore\": 0,\n");
        sb.append("  \"feedback\": \"Concise feedback explaining the technical accuracy and score reason\",\n");
        sb.append("  \"strengths\": [],\n");
        sb.append("  \"areasToImprove\": [],\n");
        sb.append("  \"weaknesses\": [],\n");
        sb.append("  \"suggestions\": []\n");
        sb.append("}\n");

        return sb.toString();
    }
}
