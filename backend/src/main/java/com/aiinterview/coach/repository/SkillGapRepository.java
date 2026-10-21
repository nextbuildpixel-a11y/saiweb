package com.aiinterview.coach.repository;

import com.aiinterview.coach.entity.SkillGap;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SkillGapRepository extends JpaRepository<SkillGap, Long> {
    List<SkillGap> findByUserIdOrderByPriorityAsc(Long userId);
}
