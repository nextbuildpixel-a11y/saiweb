package com.aiinterview.coach.service;

import com.aiinterview.coach.entity.JobRole;
import com.aiinterview.coach.repository.JobRoleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class JobRoleService {

    @Autowired
    private JobRoleRepository jobRoleRepository;

    public List<JobRole> getAllJobRoles() {
        return jobRoleRepository.findAll();
    }

    public JobRole getJobRoleById(Long id) {
        return jobRoleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Job role not found with id: " + id));
    }

    public JobRole createJobRole(JobRole role) {
        if (jobRoleRepository.existsByTitle(role.getTitle())) {
            throw new IllegalArgumentException("Job role with title '" + role.getTitle() + "' already exists.");
        }
        return jobRoleRepository.save(role);
    }

    public JobRole updateJobRole(Long id, JobRole updatedRole) {
        JobRole existing = getJobRoleById(id);
        existing.setTitle(updatedRole.getTitle());
        existing.setDescription(updatedRole.getDescription());
        return jobRoleRepository.save(existing);
    }

    public void deleteJobRole(Long id) {
        jobRoleRepository.deleteById(id);
    }
}
