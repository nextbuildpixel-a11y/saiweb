package com.aiinterview.coach.repository;

import com.aiinterview.coach.entity.GamificationProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface GamificationProgressRepository extends JpaRepository<GamificationProgress, Long> {
    Optional<GamificationProgress> findByUserId(Long userId);
}
