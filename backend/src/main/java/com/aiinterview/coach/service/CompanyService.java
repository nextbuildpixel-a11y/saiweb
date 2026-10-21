package com.aiinterview.coach.service;

import com.aiinterview.coach.entity.*;
import com.aiinterview.coach.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class CompanyService {

    @Autowired
    private CompanyRepository companyRepository;

    @Autowired
    private JobRoleRepository jobRoleRepository;

    @Autowired
    private CompanyRoleRepository companyRoleRepository;

    @Autowired
    private SkillRepository skillRepository;

    @Autowired
    private CompanyRoleSkillRepository companyRoleSkillRepository;

    @Autowired
    private CompanyPreparationSourceRepository companyPreparationSourceRepository;

    public List<Map<String, Object>> getAllCompanies(String search, String industry) {
        List<Company> companies = companyRepository.findAll();

        return companies.stream()
                .filter(c -> search == null || search.trim().isEmpty() || 
                        c.getName().toLowerCase().contains(search.toLowerCase()) || 
                        (c.getIndustry() != null && c.getIndustry().toLowerCase().contains(search.toLowerCase())))
                .filter(c -> industry == null || industry.trim().isEmpty() || 
                        (c.getIndustry() != null && c.getIndustry().equalsIgnoreCase(industry)))
                .map(this::mapCompanySummary)
                .collect(Collectors.toList());
    }

    public Map<String, Object> getCompanyDetails(Long id) {
        Company company = companyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Company profile not found with id: " + id));

        Map<String, Object> result = mapCompanySummary(company);
        
        // Fetch preparation sources
        List<CompanyPreparationSource> sources = companyPreparationSourceRepository.findByCompanyId(company.getId());
        List<Map<String, Object>> sourcesList = sources.stream().map(s -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", s.getId());
            map.put("sourceTitle", s.getSourceTitle());
            map.put("sourceUrl", s.getSourceUrl());
            map.put("descriptionNotes", s.getDescriptionNotes());
            return map;
        }).collect(Collectors.toList());
        result.put("preparationSources", sourcesList);

        // Fetch company roles
        List<CompanyRole> roles = companyRoleRepository.findByCompanyId(company.getId());
        List<Map<String, Object>> rolesList = roles.stream().map(cr -> {
            Map<String, Object> map = new HashMap<>();
            map.put("companyRoleId", cr.getId());
            map.put("roleId", cr.getJobRole().getId());
            map.put("roleTitle", cr.getJobRole().getTitle());
            map.put("difficultyLevel", cr.getDifficultyLevel());
            map.put("roleDescription", cr.getRoleDescription());

            // Fetch mapped skills
            List<CompanyRoleSkill> skills = companyRoleSkillRepository.findByCompanyRoleId(cr.getId());
            List<Map<String, Object>> skillList = skills.stream().map(crs -> {
                Map<String, Object> smap = new HashMap<>();
                smap.put("skillName", crs.getSkill().getName());
                smap.put("category", crs.getSkill().getCategory());
                smap.put("importance", crs.getImportance());
                smap.put("requiredLevel", crs.getRequiredLevel());
                return smap;
            }).collect(Collectors.toList());
            map.put("requiredSkills", skillList);

            return map;
        }).collect(Collectors.toList());
        result.put("availableRoles", rolesList);

        return result;
    }

    private Map<String, Object> mapCompanySummary(Company c) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", c.getId());
        map.put("name", c.getName());
        map.put("description", c.getDescription());
        map.put("industry", c.getIndustry());
        map.put("website", c.getWebsite());
        map.put("publicPrepInfo", c.getPublicPrepInfo());
        map.put("status", c.isStatus());
        map.put("createdAt", c.getCreatedAt());
        map.put("disclaimer", "Information displayed is derived from public prep sources and candidate experiences. AI Interview Coach does not guarantee official company hiring policies.");
        return map;
    }

    public Company createCompany(Company company) {
        if (companyRepository.existsByName(company.getName())) {
            throw new IllegalArgumentException("Company with name '" + company.getName() + "' already exists.");
        }
        return companyRepository.save(company);
    }

    public Company updateCompany(Long id, Company updatedCompany) {
        Company existing = companyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Company profile not found"));
        existing.setName(updatedCompany.getName());
        existing.setDescription(updatedCompany.getDescription());
        existing.setIndustry(updatedCompany.getIndustry());
        existing.setWebsite(updatedCompany.getWebsite());
        existing.setPublicPrepInfo(updatedCompany.getPublicPrepInfo());
        existing.setStatus(updatedCompany.isStatus());
        return companyRepository.save(existing);
    }

    public void deleteCompany(Long id) {
        companyRepository.deleteById(id);
    }

    public Company toggleCompanyStatus(Long id) {
        Company existing = companyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Company profile not found"));
        existing.setStatus(!existing.isStatus());
        return companyRepository.save(existing);
    }

    @Transactional
    public CompanyRole mapRoleToCompany(Long companyId, Long jobRoleId, String difficultyLevel, String roleDescription) {
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new RuntimeException("Company not found"));
        JobRole jobRole = jobRoleRepository.findById(jobRoleId)
                .orElseThrow(() -> new RuntimeException("Job role not found"));

        Optional<CompanyRole> existingOpt = companyRoleRepository.findByCompanyIdAndJobRoleId(companyId, jobRoleId);
        CompanyRole companyRole = existingOpt.orElseGet(CompanyRole::new);

        companyRole.setCompany(company);
        companyRole.setJobRole(jobRole);
        companyRole.setDifficultyLevel(difficultyLevel != null ? difficultyLevel : "MEDIUM");
        companyRole.setRoleDescription(roleDescription);

        return companyRoleRepository.save(companyRole);
    }

    @Transactional
    public CompanyRoleSkill addSkillToCompanyRole(Long companyRoleId, Long skillId, String importance, String requiredLevel) {
        CompanyRole companyRole = companyRoleRepository.findById(companyRoleId)
                .orElseThrow(() -> new RuntimeException("Company role mapping not found"));
        Skill skill = skillRepository.findById(skillId)
                .orElseThrow(() -> new RuntimeException("Skill not found"));

        CompanyRoleSkill crs = new CompanyRoleSkill();
        crs.setCompanyRole(companyRole);
        crs.setSkill(skill);
        crs.setImportance(importance != null ? importance : "HIGH");
        crs.setRequiredLevel(requiredLevel != null ? requiredLevel : "INTERMEDIATE");

        return companyRoleSkillRepository.save(crs);
    }

    @Transactional
    public CompanyPreparationSource addPreparationSource(Long companyId, String sourceTitle, String sourceUrl, String descriptionNotes) {
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new RuntimeException("Company not found"));

        CompanyPreparationSource source = new CompanyPreparationSource();
        source.setCompany(company);
        source.setSourceTitle(sourceTitle);
        source.setSourceUrl(sourceUrl);
        source.setDescriptionNotes(descriptionNotes);

        return companyPreparationSourceRepository.save(source);
    }
}
