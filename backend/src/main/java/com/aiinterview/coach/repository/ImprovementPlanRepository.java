package com.aiinterview.coach.repository;

import com.aiinterview.coach.entity.ImprovementPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ImprovementPlanRepository extends JpaRepository<ImprovementPlan, Long> {
    List<ImprovementPlan> findByUserId(Long userId);
}
