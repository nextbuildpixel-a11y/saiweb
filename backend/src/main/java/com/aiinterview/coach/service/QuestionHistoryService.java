package com.aiinterview.coach.service;

import com.aiinterview.coach.entity.Interview;
import com.aiinterview.coach.entity.QuestionHistory;
import com.aiinterview.coach.entity.User;
import com.aiinterview.coach.repository.QuestionHistoryRepository;
import com.aiinterview.coach.util.TextSimilarityUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class QuestionHistoryService {

    @Autowired
    private QuestionHistoryRepository questionHistoryRepository;

    public boolean isDuplicateOrSimilar(Long userId, String candidateQuestionText) {
        if (candidateQuestionText == null || candidateQuestionText.trim().isEmpty()) {
            return true;
        }

        List<QuestionHistory> historyList = questionHistoryRepository.findByUserId(userId);

        for (QuestionHistory qh : historyList) {
            if (qh.getQuestionText() != null) {
                // 1. Exact string match
                if (qh.getQuestionText().trim().equalsIgnoreCase(candidateQuestionText.trim())) {
                    return true;
                }
                // 2. Token Jaccard similarity check (> 0.65)
                if (TextSimilarityUtil.isTooSimilar(qh.getQuestionText(), candidateQuestionText)) {
                    return true;
                }
            }
        }

        return false;
    }

    @Transactional
    public void recordQuestionHistory(User user, Interview interview, String questionText) {
        QuestionHistory qh = new QuestionHistory();
        qh.setUser(user);
        qh.setInterview(interview);
        qh.setQuestionText(questionText);
        qh.setQuestionHash(String.valueOf(questionText.hashCode()));
        qh.setAskedAt(LocalDateTime.now());
        questionHistoryRepository.save(qh);
    }
}
