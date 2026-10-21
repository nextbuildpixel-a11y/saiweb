package com.aiinterview.coach.service;

import com.aiinterview.coach.ai.AIService;
import com.aiinterview.coach.entity.Evaluation;
import com.aiinterview.coach.entity.Interview;
import com.aiinterview.coach.entity.InterviewQuestion;
import com.aiinterview.coach.entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class AdaptiveEngineService {

    @Autowired
    private AIService aiService;

    @Autowired
    private QuestionHistoryService questionHistoryService;

    private static final int MAX_GENERATION_ATTEMPTS = 3;

    public String determineNextDifficulty(String currentDifficulty, List<Evaluation> previousEvals) {
        if (previousEvals == null || previousEvals.isEmpty()) {
            return currentDifficulty != null ? currentDifficulty : "MEDIUM";
        }

        double total = 0;
        for (Evaluation eval : previousEvals) {
            if (eval.getOverallScore() != null) {
                total += eval.getOverallScore();
            }
        }
        double avgScore = total / previousEvals.size();

        if (avgScore >= 82.0) {
            if ("EASY".equalsIgnoreCase(currentDifficulty)) return "MEDIUM";
            if ("MEDIUM".equalsIgnoreCase(currentDifficulty)) return "HARD";
            return "HARD";
        } else if (avgScore < 60.0) {
            if ("HARD".equalsIgnoreCase(currentDifficulty)) return "MEDIUM";
            if ("MEDIUM".equalsIgnoreCase(currentDifficulty)) return "EASY";
            return "EASY";
        }

        return currentDifficulty != null ? currentDifficulty : "MEDIUM";
    }

    public Map<String, Object> generateAdaptiveQuestion(
            Interview interview,
            List<InterviewQuestion> existingQuestions,
            List<Evaluation> previousEvals) {

        User user = interview.getUser();
        String companyName = interview.getCompany() != null ? interview.getCompany().getName() : "General Enterprise";
        String roleTitle = interview.getJobRole() != null ? interview.getJobRole().getTitle() : "Software Engineer";

        // Calculate dynamic difficulty
        String currentDifficulty = determineNextDifficulty(interview.getDifficulty(), previousEvals);

        // Decide if a follow-up question is appropriate
        boolean createFollowUp = false;
        String lastQuestionText = "";
        String lastStudentAnswerText = "";

        if (!existingQuestions.isEmpty() && !previousEvals.isEmpty()) {
            InterviewQuestion lastQuestion = existingQuestions.get(existingQuestions.size() - 1);
            Evaluation lastEval = previousEvals.get(previousEvals.size() - 1);

            if (lastEval.getOverallScore() != null && lastEval.getOverallScore() >= 65.0 && lastEval.getOverallScore() <= 88.0) {
                createFollowUp = true;
                lastQuestionText = lastQuestion.getQuestionText();
                if (lastEval.getAnswer() != null) {
                    lastStudentAnswerText = lastEval.getAnswer().getAnswerText();
                }
            }
        }

        List<String> previousQuestionTexts = new ArrayList<>();
        for (InterviewQuestion q : existingQuestions) {
            previousQuestionTexts.add(q.getQuestionText());
        }

        Map<String, Object> chosenQuestion = null;
        int attempts = 0;

        while (attempts < MAX_GENERATION_ATTEMPTS) {
            attempts++;
            Map<String, Object> candidate;

            if (createFollowUp) {
                candidate = aiService.generateFollowUpQuestion(lastQuestionText, lastStudentAnswerText, roleTitle + " at " + companyName);
                candidate.put("isFollowUp", true);
                if (!existingQuestions.isEmpty()) {
                    candidate.put("parentQuestionId", existingQuestions.get(existingQuestions.size() - 1).getId());
                }
            } else {
                candidate = aiService.generateInterviewQuestion(
                        companyName,
                        roleTitle,
                        Arrays.asList("Java", "Data Structures", "System Design", "SQL"),
                        currentDifficulty,
                        interview.getInterviewType(),
                        previousQuestionTexts
                );
                candidate.put("isFollowUp", false);
            }

            String candidateText = (String) candidate.get("questionText");

            // Check non-repetition and token similarity against candidate's history
            if (!questionHistoryService.isDuplicateOrSimilar(user.getId(), candidateText)) {
                chosenQuestion = candidate;
                break;
            }
        }

        // Fallback loop safety: if all 3 attempts returned similar questions, accept the last candidate
        if (chosenQuestion == null) {
            chosenQuestion = aiService.generateInterviewQuestion(
                    companyName,
                    roleTitle,
                    Arrays.asList("Core Concepts", "Problem Solving"),
                    currentDifficulty,
                    interview.getInterviewType(),
                    previousQuestionTexts
            );
            chosenQuestion.put("isFallback", true);
        }

        chosenQuestion.put("adaptedDifficulty", currentDifficulty);
        return chosenQuestion;
    }
}
