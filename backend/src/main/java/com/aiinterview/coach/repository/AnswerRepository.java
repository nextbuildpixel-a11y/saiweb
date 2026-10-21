package com.aiinterview.coach.repository;

import com.aiinterview.coach.entity.Answer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface AnswerRepository extends JpaRepository<Answer, Long> {
    Optional<Answer> findByInterviewQuestionId(Long interviewQuestionId);
}
