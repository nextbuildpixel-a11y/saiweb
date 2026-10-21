package com.aiinterview.coach.service;

import com.aiinterview.coach.entity.JobDescription;
import com.aiinterview.coach.entity.Resume;
import com.aiinterview.coach.entity.User;
import com.aiinterview.coach.repository.JobDescriptionRepository;
import com.aiinterview.coach.repository.UserRepository;
import com.aiinterview.coach.util.FileStorageUtil;
import com.aiinterview.coach.util.ResumeTextExtractor;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.*;

@Service
public class JobDescriptionService {

    @Autowired
    private JobDescriptionRepository jobDescriptionRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ResumeService resumeService;

    @Autowired
    private FileStorageUtil fileStorageUtil;

    @Autowired
    private ResumeTextExtractor textExtractor;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Transactional
    public Map<String, Object> analyzeJobDescription(
            String roleTitle,
            String companyName,
            String descriptionText,
            MultipartFile file,
            String email) throws IOException {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Student user profile not found"));

        String textToAnalyze = descriptionText;
        if (file != null && !file.isEmpty()) {
            String storedPath = fileStorageUtil.storeResumeFile(file);
            textToAnalyze = textExtractor.extractText(new File(storedPath));
        }

        if (textToAnalyze == null || textToAnalyze.trim().isEmpty()) {
            throw new IllegalArgumentException("Job description text or file must be provided.");
        }

        // Fetch student's latest uploaded resume from Phase 5
        Optional<Resume> latestResumeOpt = resumeService.getLatestResume(email);
        String resumeText = latestResumeOpt.map(Resume::getExtractedText).orElse("");

        // Generate JD vs Resume Comparison Analysis
        Map<String, Object> analysis = generateJdComparisonAnalysis(
                roleTitle, companyName, textToAnalyze, resumeText
        );

        JobDescription jd = new JobDescription();
        jd.setUser(user);
        jd.setRoleTitle(roleTitle != null ? roleTitle : "Software Engineer");
        jd.setCompanyName(companyName != null ? companyName : "Target Enterprise");
        jd.setDescriptionText(textToAnalyze);
        jd.setMatchPercentage((Integer) analysis.get("matchPercentage"));
        jd.setAnalysisJson(objectMapper.writeValueAsString(analysis));

        JobDescription savedJd = jobDescriptionRepository.save(jd);
        analysis.put("id", savedJd.getId());
        analysis.put("createdAt", savedJd.getCreatedAt());

        return analysis;
    }

    public List<Map<String, Object>> getJobDescriptionHistory(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Student user profile not found"));

        List<JobDescription> list = jobDescriptionRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
        List<Map<String, Object>> result = new ArrayList<>();

        for (JobDescription jd : list) {
            Map<String, Object> item = new HashMap<>();
            item.put("id", jd.getId());
            item.put("roleTitle", jd.getRoleTitle());
            item.put("companyName", jd.getCompanyName());
            item.put("matchPercentage", jd.getMatchPercentage());
            item.put("createdAt", jd.getCreatedAt());
            result.add(item);
        }

        return result;
    }

    public Map<String, Object> getJobDescriptionById(Long id, String email) throws IOException {
        JobDescription jd = jobDescriptionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Job Description record not found"));

        Map<String, Object> response = new HashMap<>();
        response.put("id", jd.getId());
        response.put("roleTitle", jd.getRoleTitle());
        response.put("companyName", jd.getCompanyName());
        response.put("descriptionText", jd.getDescriptionText());
        response.put("matchPercentage", jd.getMatchPercentage());
        response.put("createdAt", jd.getCreatedAt());

        if (jd.getAnalysisJson() != null) {
            response.put("analysis", objectMapper.readValue(jd.getAnalysisJson(), Map.class));
        }

        return response;
    }

    private Map<String, Object> generateJdComparisonAnalysis(
            String roleTitle,
            String companyName,
            String jdText,
            String resumeText) {

        Map<String, Object> analysis = new HashMap<>();

        String lowerJd = jdText.toLowerCase();
        String lowerResume = resumeText.toLowerCase();

        List<String> requiredSkills = Arrays.asList("JAVA", "SQL", "SPRING BOOT", "DSA", "DBMS", "REST API");
        List<String> preferredSkills = Arrays.asList("REACT", "DOCKER", "MICROSERVICES", "AWS", "SYSTEM DESIGN");

        List<String> matchingSkills = new ArrayList<>();
        List<String> missingSkills = new ArrayList<>();

        for (String skill : requiredSkills) {
            if (lowerResume.contains(skill.toLowerCase())) {
                matchingSkills.add(skill);
            } else {
                missingSkills.add(skill);
            }
        }

        for (String skill : preferredSkills) {
            if (lowerResume.contains(skill.toLowerCase())) {
                matchingSkills.add(skill);
            } else {
                missingSkills.add(skill);
            }
        }

        int matchPercentage = Math.min(Math.max((matchingSkills.size() * 100) / (requiredSkills.size() + preferredSkills.size()) + 25, 60), 95);

        analysis.put("matchPercentage", matchPercentage);
        analysis.put("roleTitle", roleTitle != null ? roleTitle : "Software Engineer");
        analysis.put("companyName", companyName != null ? companyName : "Target Enterprise");
        
        analysis.put("requiredSkills", requiredSkills);
        analysis.put("preferredSkills", preferredSkills);
        analysis.put("matchingSkills", matchingSkills);
        analysis.put("missingSkills", missingSkills);
        analysis.put("prioritySkills", Arrays.asList("DATA STRUCTURES & ALGORITHMS (DSA)", "DOCKER", "MICROSERVICES"));

        analysis.put("technicalRequirements", Arrays.asList(
            "Strong proficiency in Core Java, OOP, and Spring Boot framework",
            "Relational Database Design and SQL query optimization",
            "Data Structures & Algorithms problem solving for scalable systems"
        ));

        analysis.put("educationRequirements", "B.Tech / B.E in Computer Science, IT, or related technical discipline (CGPA >= 7.5)");
        analysis.put("experienceRequirements", "0 to 2 Years (Freshers / Campus Placement Candidates)");
        analysis.put("softSkills", Arrays.asList("Problem Solving", "Technical Communication", "Agile Collaboration"));

        analysis.put("recommendations", Arrays.asList(
            "High Priority: Practice medium-level Array, Tree, and DP DSA problems to match target technical rounds.",
            "Resume Tweak: Emphasize Spring Boot REST API integration and MySQL indexing in your project descriptions.",
            "Mock Preparation: Schedule a 30-minute Technical Text/Voice Mock Interview for " + (companyName != null ? companyName : "this role") + "."
        ));

        return analysis;
    }
}
