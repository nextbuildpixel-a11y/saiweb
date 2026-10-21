package com.aiinterview.coach.repository;

import com.aiinterview.coach.entity.CompanyRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface CompanyRoleRepository extends JpaRepository<CompanyRole, Long> {
    List<CompanyRole> findByCompanyId(Long companyId);
    Optional<CompanyRole> findByCompanyIdAndJobRoleId(Long companyId, Long jobRoleId);
}
