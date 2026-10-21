package com.aiinterview.coach.repository;

import com.aiinterview.coach.entity.CompanyRoleSkill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CompanyRoleSkillRepository extends JpaRepository<CompanyRoleSkill, Long> {
    List<CompanyRoleSkill> findByCompanyRoleId(Long companyRoleId);
}
