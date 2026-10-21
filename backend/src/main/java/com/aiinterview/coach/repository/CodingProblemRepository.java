package com.aiinterview.coach.repository;

import com.aiinterview.coach.entity.CodingProblem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CodingProblemRepository extends JpaRepository<CodingProblem, Long> {
    List<CodingProblem> findByTopic(String topic);
    List<CodingProblem> findByDifficulty(String difficulty);
}
