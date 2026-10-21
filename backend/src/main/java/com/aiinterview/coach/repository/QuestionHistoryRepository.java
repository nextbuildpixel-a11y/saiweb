package com.aiinterview.coach.repository;

import com.aiinterview.coach.entity.QuestionHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface QuestionHistoryRepository extends JpaRepository<QuestionHistory, Long> {
    List<QuestionHistory> findByUserId(Long userId);
    boolean existsByUserIdAndQuestionHash(Long userId, String questionHash);
}
