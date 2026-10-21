package com.aiinterview.coach.repository;

import com.aiinterview.coach.entity.PlacementRound;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PlacementRoundRepository extends JpaRepository<PlacementRound, Long> {
    List<PlacementRound> findByDriveIdOrderByRoundNumberAsc(Long driveId);
}
