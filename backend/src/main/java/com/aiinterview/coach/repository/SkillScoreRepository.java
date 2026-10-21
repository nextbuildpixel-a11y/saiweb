package com.aiinterview.coach.repository;

import com.aiinterview.coach.entity.SkillScore;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface SkillScoreRepository extends JpaRepository<SkillScore, Long> {
    List<SkillScore> findByUserId(Long userId);
    Optional<SkillScore> findByUserIdAndSkillId(Long userId, Long skillId);
}
