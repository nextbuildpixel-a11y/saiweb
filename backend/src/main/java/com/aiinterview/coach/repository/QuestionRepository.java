package com.aiinterview.coach.repository;

import com.aiinterview.coach.entity.Question;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface QuestionRepository extends JpaRepository<Question, Long> {
    List<Question> findByCategory(String category);
    List<Question> findBySkillName(String skillName);
    List<Question> findBySkillNameAndDifficulty(String skillName, String difficulty);
}
