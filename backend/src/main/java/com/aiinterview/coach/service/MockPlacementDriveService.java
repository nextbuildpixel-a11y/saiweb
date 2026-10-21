package com.aiinterview.coach.service;

import com.aiinterview.coach.entity.*;
import com.aiinterview.coach.repository.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class MockPlacementDriveService {

    @Autowired
    private MockPlacementDriveRepository mockPlacementDriveRepository;

    @Autowired
    private PlacementRoundRepository placementRoundRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CompanyRepository companyRepository;

    @Autowired
    private JobRoleRepository jobRoleRepository;

    @Autowired
    private PlacementPrepService placementPrepService;

    @Autowired
    private AdaptiveEngineService adaptiveEngineService;

    @Autowired
    private com.aiinterview.coach.ai.AIService aiService;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private static final double QUALIFICATION_THRESHOLD = 50.0;

    @Transactional
    public MockPlacementDrive createDrive(Long companyId, Long jobRoleId, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Student user not found"));

        Company company = companyId != null ? companyRepository.findById(companyId).orElse(null) : null;
        JobRole jobRole = jobRoleId != null ? jobRoleRepository.findById(jobRoleId).orElse(null) : null;

        MockPlacementDrive drive = new MockPlacementDrive();
        drive.setUser(user);
        drive.setCompany(company);
        drive.setJobRole(jobRole);
        drive.setStatus("IN_PROGRESS");
        drive.setStartedAt(LocalDateTime.now());
        MockPlacementDrive savedDrive = mockPlacementDriveRepository.save(drive);

        // Pre-create 5 Rounds
        String[] roundTypes = {"Aptitude", "Technical MCQ", "Coding", "Technical Interview", "HR Interview"};
        for (int i = 0; i < 5; i++) {
            PlacementRound round = new PlacementRound();
            round.setDrive(savedDrive);
            round.setRoundNumber(i + 1);
            round.setRoundType(roundTypes[i]);
            round.setStatus(i == 0 ? "IN_PROGRESS" : "PENDING");
            round.setStartedAt(LocalDateTime.now());
            placementRoundRepository.save(round);
        }

        return savedDrive;
    }

    public Map<String, Object> getCurrentRound(Long driveId, String email) throws Exception {
        MockPlacementDrive drive = validateDriveOwnership(driveId, email);
        List<PlacementRound> rounds = placementRoundRepository.findByDriveIdOrderByRoundNumberAsc(drive.getId());

        PlacementRound activeRound = rounds.stream()
                .filter(r -> "IN_PROGRESS".equalsIgnoreCase(r.getStatus()))
                .findFirst()
                .orElse(null);

        Map<String, Object> resp = new HashMap<>();
        resp.put("driveId", drive.getId());
        resp.put("companyName", drive.getCompany() != null ? drive.getCompany().getName() : "Enterprise Drive");
        resp.put("roleTitle", drive.getJobRole() != null ? drive.getJobRole().getTitle() : "Software Development Engineer");
        resp.put("driveStatus", drive.getStatus());

        if (activeRound == null) {
            resp.put("isCompleted", true);
            resp.put("message", "All 5 placement rounds have been completed.");
            return resp;
        }

        resp.put("roundId", activeRound.getId());
        resp.put("roundNumber", activeRound.getRoundNumber());
        resp.put("roundType", activeRound.getRoundType());
        resp.put("roundStatus", activeRound.getStatus());

        // Round Payload Generation
        if (activeRound.getRoundNumber() == 1) {
            resp.put("content", placementPrepService.getQuestions("APTITUDE", "ALL"));
        } else if (activeRound.getRoundNumber() == 2) {
            resp.put("content", placementPrepService.getQuestions("TECHNICAL_MCQ", "ALL"));
        } else if (activeRound.getRoundNumber() == 3) {
            resp.put("content", placementPrepService.getCodingProblems("Arrays", "Easy"));
        } else if (activeRound.getRoundNumber() == 4) {
            Map<String, Object> qMap = new HashMap<>();
            qMap.put("questionText", "What is the difference between process and thread in Operating Systems, and how does Java handle multi-threading?");
            qMap.put("category", "Operating Systems");
            resp.put("content", qMap);
        } else if (activeRound.getRoundNumber() == 5) {
            Map<String, Object> qMap = new HashMap<>();
            qMap.put("questionText", "Tell me about a time when you faced a major technical challenge during a project. Structure using STAR framework.");
            qMap.put("category", "Behavioral HR");
            resp.put("content", qMap);
        }

        return resp;
    }

    @Transactional
    public Map<String, Object> submitRound(Long driveId, Map<String, Object> submissionPayload, String email) throws Exception {
        MockPlacementDrive drive = validateDriveOwnership(driveId, email);
        List<PlacementRound> rounds = placementRoundRepository.findByDriveIdOrderByRoundNumberAsc(drive.getId());

        PlacementRound activeRound = rounds.stream()
                .filter(r -> "IN_PROGRESS".equalsIgnoreCase(r.getStatus()))
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("No active round in progress for this placement drive."));

        double roundScore = 80.0;
        int roundNumber = activeRound.getRoundNumber();

        if (roundNumber == 1) {
            Map<?, ?> userAnswers = (Map<?, ?>) submissionPayload.get("answers");
            Map<String, Object> testRes = placementPrepService.submitTestAttempt(userAnswers, "APTITUDE", email);
            roundScore = ((Number) testRes.get("scorePercentage")).doubleValue();
        } else if (roundNumber == 2) {
            Map<?, ?> userAnswers = (Map<?, ?>) submissionPayload.get("answers");
            Map<String, Object> testRes = placementPrepService.submitTestAttempt(userAnswers, "TECHNICAL_MCQ", email);
            roundScore = ((Number) testRes.get("scorePercentage")).doubleValue();
        } else if (roundNumber == 3) {
            String code = (String) submissionPayload.get("code");
            Long problemId = submissionPayload.get("problemId") != null ? Long.valueOf(submissionPayload.get("problemId").toString()) : 1L;
            Map<String, Object> codeRes = placementPrepService.submitCodeSolution(problemId, code, email);
            roundScore = ((Number) codeRes.get("score")).doubleValue();
        } else if (roundNumber == 4) {
            String answerText = (String) submissionPayload.get("answerText");
            Map<String, Object> evalMap = aiService.evaluateAnswer("Technical Interview Question", answerText, "Core Technical Concepts");
            roundScore = ((Number) evalMap.get("overallScore")).doubleValue();
        } else if (roundNumber == 5) {
            String answerText = (String) submissionPayload.get("answerText");
            Map<String, Object> starRes = placementPrepService.evaluateStarResponse("HR Question", answerText);
            roundScore = ((Number) starRes.get("overallScore")).doubleValue();
        }

        activeRound.setScore(roundScore);
        boolean isQualified = roundScore >= QUALIFICATION_THRESHOLD;
        activeRound.setStatus(isQualified ? "PASSED" : "FAILED");
        activeRound.setCompletedAt(LocalDateTime.now());
        placementRoundRepository.save(activeRound);

        Map<String, Object> resp = new HashMap<>();
        resp.put("roundNumber", roundNumber);
        resp.put("roundType", activeRound.getRoundType());
        resp.put("score", roundScore);
        resp.put("isQualified", isQualified);

        if (!isQualified) {
            drive.setStatus("FAILED");
            drive.setCompletedAt(LocalDateTime.now());
            mockPlacementDriveRepository.save(drive);
            resp.put("driveStatus", "FAILED");
            resp.put("message", "Candidate scored " + roundScore + "%, below qualification cutoff (" + QUALIFICATION_THRESHOLD + "%). Placement drive terminated.");
            return resp;
        }

        // Advance to next round if available
        if (roundNumber < 5) {
            PlacementRound nextRound = rounds.get(roundNumber);
            nextRound.setStatus("IN_PROGRESS");
            nextRound.setStartedAt(LocalDateTime.now());
            placementRoundRepository.save(nextRound);
            resp.put("nextRoundNumber", nextRound.getRoundNumber());
            resp.put("driveStatus", "IN_PROGRESS");
        } else {
            // Final Round 5 completed! Calculate final overall score
            double totalScoreSum = 0;
            for (PlacementRound r : rounds) {
                if (r.getScore() != null) totalScoreSum += r.getScore();
            }
            double finalScore = Math.round((totalScoreSum / 5.0) * 10.0) / 10.0;
            drive.setFinalScore(finalScore);
            drive.setStatus("COMPLETED");
            drive.setCompletedAt(LocalDateTime.now());
            mockPlacementDriveRepository.save(drive);

            resp.put("driveStatus", "COMPLETED");
            resp.put("finalScore", finalScore);
            resp.put("message", "Congratulations! You completed all 5 campus placement drive rounds.");
        }

        return resp;
    }

    public Map<String, Object> getDriveReport(Long driveId, String email) throws Exception {
        MockPlacementDrive drive = validateDriveOwnership(driveId, email);
        List<PlacementRound> rounds = placementRoundRepository.findByDriveIdOrderByRoundNumberAsc(drive.getId());

        Map<String, Object> report = new HashMap<>();
        report.put("driveId", drive.getId());
        report.put("companyName", drive.getCompany() != null ? drive.getCompany().getName() : "Enterprise Drive");
        report.put("roleTitle", drive.getJobRole() != null ? drive.getJobRole().getTitle() : "Software Development Engineer");
        report.put("driveStatus", drive.getStatus());
        report.put("finalScore", drive.getFinalScore() != null ? drive.getFinalScore() : 82.0);
        report.put("startedAt", drive.getStartedAt());
        report.put("completedAt", drive.getCompletedAt());
        report.put("disclaimer", "This report is a simulated campus mock placement assessment and does not guarantee an official hiring decision from the company.");

        List<Map<String, Object>> roundBreakdown = new ArrayList<>();
        for (PlacementRound r : rounds) {
            Map<String, Object> rMap = new HashMap<>();
            rMap.put("roundNumber", r.getRoundNumber());
            rMap.put("roundType", r.getRoundType());
            rMap.put("score", r.getScore() != null ? r.getScore() : 0.0);
            rMap.put("status", r.getStatus());
            roundBreakdown.add(rMap);
        }
        report.put("rounds", roundBreakdown);

        return report;
    }

    private MockPlacementDrive validateDriveOwnership(Long driveId, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Student user not found"));

        MockPlacementDrive drive = mockPlacementDriveRepository.findById(driveId)
                .orElseThrow(() -> new RuntimeException("Mock placement drive session not found"));

        if (!drive.getUser().getId().equals(user.getId())) {
            throw new SecurityException("Unauthorized access to mock placement drive session");
        }

        return drive;
    }
}
