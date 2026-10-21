package com.aiinterview.coach.repository;

import com.aiinterview.coach.entity.CompanyPreparationSource;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CompanyPreparationSourceRepository extends JpaRepository<CompanyPreparationSource, Long> {
    List<CompanyPreparationSource> findByCompanyId(Long companyId);
}
