package com.aiinterview.coach.repository;

import com.aiinterview.coach.entity.Interview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface InterviewRepository extends JpaRepository<Interview, Long> {
    List<Interview> findByUserIdOrderByStartedAtDesc(Long userId);
    List<Interview> findByUserIdAndStatus(Long userId, String status);
}
