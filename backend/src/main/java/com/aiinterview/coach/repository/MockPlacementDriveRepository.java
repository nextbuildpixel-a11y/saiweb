package com.aiinterview.coach.repository;

import com.aiinterview.coach.entity.MockPlacementDrive;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface MockPlacementDriveRepository extends JpaRepository<MockPlacementDrive, Long> {
    List<MockPlacementDrive> findByUserIdOrderByStartedAtDesc(Long userId);
}
