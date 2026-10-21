package com.aiinterview.coach.config;

import com.aiinterview.coach.entity.*;
import com.aiinterview.coach.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private AdminRepository adminRepository;

    @Autowired
    private UserRepository userRepository;

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
    private QuestionRepository questionRepository;

    @Autowired
    private CodingProblemRepository codingProblemRepository;

    @Autowired
    private PlacementTestRepository placementTestRepository;

    @Autowired
    private TestQuestionRepository testQuestionRepository;

    @Autowired
    private GamificationProgressRepository gamificationProgressRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // 1. Seed default Admin user
        if (adminRepository.count() == 0) {
            Admin admin = new Admin();
            admin.setFullName("Platform System Administrator");
            admin.setEmail("admin@aiinterview.com");
            admin.setPasswordHash(passwordEncoder.encode("admin123"));
            admin.setRole("ROLE_ADMIN");
            admin.setActive(true);
            adminRepository.save(admin);
            System.out.println(">>> Seeded Admin: admin@aiinterview.com / admin123");
        }

        // 2. Seed default Student user & Gamification profile
        User student = null;
        if (userRepository.count() == 0) {
            student = new User();
            student.setFullName("Alex Morgan");
            student.setEmail("student@aiinterview.com");
            student.setPasswordHash(passwordEncoder.encode("student123"));
            student.setPhone("9876543210");
            student.setCollege("Institute of Technology");
            student.setDegree("B.Tech");
            student.setBranch("Computer Science & Engineering");
            student.setGraduationYear(2026);
            student.setCgpa(8.8);
            student.setTargetRole("Full Stack Software Engineer");
            student.setExperienceLevel("Student");
            student.setTargetSkills("[\"Java\", \"React\", \"Data Structures\", \"Spring Boot\", \"SQL\"]");
            student.setBio("Final-year Computer Science student passionate about distributed systems, modern web frameworks, and algorithmic problem solving.");
            student.setGithubUrl("https://github.com/alexmorgan-dev");
            student.setLinkedinUrl("https://linkedin.com/in/alexmorgan");
            student.setPortfolioUrl("https://alexmorgan.dev");
            student.setRole("ROLE_USER");
            student.setActive(true);
            student = userRepository.save(student);
            System.out.println(">>> Seeded Student: student@aiinterview.com / student123");

            GamificationProgress progress = new GamificationProgress(student);
            gamificationProgressRepository.save(progress);
        }

        // 3. Seed Skills Master Data
        if (skillRepository.count() == 0) {
            List<Skill> skills = Arrays.asList(
                new Skill("Java", "TECHNICAL"),
                new Skill("SQL", "TECHNICAL"),
                new Skill("DBMS", "TECHNICAL"),
                new Skill("DSA", "CODING"),
                new Skill("OOP", "TECHNICAL"),
                new Skill("Spring Boot", "TECHNICAL"),
                new Skill("Communication", "COMMUNICATION"),
                new Skill("Quantitative Aptitude", "APTITUDE"),
                new Skill("Logical Reasoning", "APTITUDE"),
                new Skill("STAR Behavioral", "BEHAVIORAL")
            );
            skillRepository.saveAll(skills);
            System.out.println(">>> Seeded 10 Master Skills");
        }

        // 4. Seed Companies
        if (companyRepository.count() == 0) {
            List<Company> companies = Arrays.asList(
                new Company("Amazon", "Global e-commerce and cloud computing enterprise.", "Technology", "https://amazon.jobs", "Commonly reported focus areas: Leadership Principles, DSA, System Design."),
                new Company("Microsoft", "Global software and hardware leader.", "Software", "https://careers.microsoft.com", "Commonly reported focus areas: Algorithmic problem solving, Data Structures, OOP."),
                new Company("Google", "Multinational technology company focusing on search & AI.", "Technology", "https://careers.google.com", "Commonly reported focus areas: Deep DSA, Dynamic Programming, Scalability."),
                new Company("TCS", "Leading IT services and consulting provider.", "IT Services", "https://tcs.com/careers", "Commonly reported focus areas: Aptitude, Basic Java/C++, DBMS concepts."),
                new Company("Infosys", "Global leader in next-generation digital services.", "IT Services", "https://infosys.com/careers", "Commonly reported focus areas: Logic building, OOP, Verbal ability.")
            );
            companyRepository.saveAll(companies);
            System.out.println(">>> Seeded 5 Companies");
        }

        // 5. Seed Job Roles
        if (jobRoleRepository.count() == 0) {
            List<JobRole> roles = Arrays.asList(
                new JobRole("Software Development Engineer", "Designs and implements scalable software solutions."),
                new JobRole("Java Developer", "Specializes in enterprise Java and Spring Boot microservices."),
                new JobRole("Data Engineer", "Builds data pipelines, ETL workflows, and relational SQL architectures."),
                new JobRole("Full Stack Developer", "Develops end-to-end web applications with React & REST APIs.")
            );
            jobRoleRepository.saveAll(roles);
            System.out.println(">>> Seeded 4 Job Roles");
        }

        // 6. Seed Company-Role Mappings
        if (companyRoleRepository.count() == 0 && companyRepository.count() > 0 && jobRoleRepository.count() > 0) {
            Company amazon = companyRepository.findByName("Amazon").orElse(null);
            Company google = companyRepository.findByName("Google").orElse(null);
            JobRole sde = jobRoleRepository.findByTitle("Software Development Engineer").orElse(null);

            if (amazon != null && sde != null) {
                CompanyRole cr1 = new CompanyRole(amazon, sde, "HARD", "Amazon SDE-1 placement drive role");
                companyRoleRepository.save(cr1);
            }
            if (google != null && sde != null) {
                CompanyRole cr2 = new CompanyRole(google, sde, "HARD", "Google University Graduate SDE role");
                companyRoleRepository.save(cr2);
            }
            System.out.println(">>> Seeded Company-Role Mappings");
        }

        // 7. Seed Base Question Bank
        if (questionRepository.count() == 0) {
            List<Question> questions = Arrays.asList(
                new Question("What is the difference between method overloading and method overriding in Java?", "TECHNICAL", "Java", "MEDIUM", "Technical"),
                new Question("Explain how a HashMap handles collisions internally in Java 8.", "TECHNICAL", "Java", "HARD", "Technical"),
                new Question("What is a Database Index and how does B-Tree indexing improve search query speed?", "TECHNICAL", "DBMS", "MEDIUM", "Technical"),
                new Question("Explain the difference between INNER JOIN and LEFT JOIN in SQL with an example.", "TECHNICAL", "SQL", "EASY", "Technical"),
                new Question("Tell me about a time when you faced a difficult conflict in a team project and how you resolved it.", "BEHAVIORAL", "STAR Behavioral", "MEDIUM", "HR"),
                new Question("Why do you want to join our company and where do you see yourself in 5 years?", "HR", "Communication", "EASY", "HR")
            );
            questionRepository.saveAll(questions);
            System.out.println(">>> Seeded Base Question Bank");
        }

        // 8. Seed DSA Coding Problems
        if (codingProblemRepository.count() == 0) {
            CodingProblem p1 = new CodingProblem();
            p1.setTitle("Two Sum");
            p1.setDescriptionText("Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.");
            p1.setDifficulty("Easy");
            p1.setTopic("Arrays");
            p1.setConstraintsText("2 <= nums.length <= 10^4\n-10^9 <= nums[i] <= 10^9");
            p1.setSampleInput("[2, 7, 11, 15], target = 9");
            p1.setSampleOutput("[0, 1]");
            p1.setExpectedComplexity("O(N) Time, O(N) Space");
            p1.setTestDataJson("[{\"input\":\"[2,7,11,15], 9\",\"expected\":\"[0,1]\"}]");

            CodingProblem p2 = new CodingProblem();
            p2.setTitle("Reverse a Linked List");
            p2.setDescriptionText("Given the head of a singly linked list, reverse the list and return the reversed list head.");
            p2.setDifficulty("Easy");
            p2.setTopic("Linked Lists");
            p2.setConstraintsText("0 <= Number of nodes <= 5000");
            p2.setSampleInput("1 -> 2 -> 3 -> 4 -> 5");
            p2.setSampleOutput("5 -> 4 -> 3 -> 2 -> 1");
            p2.setExpectedComplexity("O(N) Time, O(1) Space");
            p2.setTestDataJson("[{\"input\":\"[1,2,3,4,5]\",\"expected\":\"[5,4,3,2,1]\"}]");

            codingProblemRepository.saveAll(Arrays.asList(p1, p2));
            System.out.println(">>> Seeded 2 DSA Coding Problems");
        }

        // 9. Seed Aptitude Placement Tests
        if (placementTestRepository.count() == 0) {
            PlacementTest test = new PlacementTest("Standard Campus Aptitude Assessment", "APTITUDE", 30, 100);
            PlacementTest savedTest = placementTestRepository.save(test);

            TestQuestion q1 = new TestQuestion();
            q1.setPlacementTest(savedTest);
            q1.setQuestionText("A train 150 meters long passes a telegraph post in 12 seconds. Find the speed of the train in km/hr.");
            q1.setOptionA("40 km/hr");
            q1.setOptionB("45 km/hr");
            q1.setOptionC("50 km/hr");
            q1.setOptionD("55 km/hr");
            q1.setCorrectOption("B");
            q1.setExplanation("Speed = Distance / Time = 150m / 12s = 12.5 m/s = 12.5 * (18/5) = 45 km/hr.");
            q1.setMarks(10);

            testQuestionRepository.save(q1);
            System.out.println(">>> Seeded Aptitude Placement Test");
        }
    }
}
