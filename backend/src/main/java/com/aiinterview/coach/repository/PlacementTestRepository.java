package com.aiinterview.coach.repository;

import com.aiinterview.coach.entity.PlacementTest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PlacementTestRepository extends JpaRepository<PlacementTest, Long> {
    List<PlacementTest> findByRoundType(String roundType);
}
