package com.aiinterview.coach.service;

import com.aiinterview.coach.dto.AuthRequest;
import com.aiinterview.coach.dto.JwtResponse;
import com.aiinterview.coach.dto.RegisterRequest;
import com.aiinterview.coach.entity.Admin;
import com.aiinterview.coach.entity.GamificationProgress;
import com.aiinterview.coach.entity.User;
import com.aiinterview.coach.repository.AdminRepository;
import com.aiinterview.coach.repository.GamificationProgressRepository;
import com.aiinterview.coach.repository.UserRepository;
import com.aiinterview.coach.security.JwtTokenProvider;
import com.aiinterview.coach.security.UserPrincipal;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AdminRepository adminRepository;

    @Autowired
    private GamificationProgressRepository gamificationProgressRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtTokenProvider tokenProvider;

    @Transactional
    public JwtResponse registerStudent(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail()) || adminRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email address is already registered!");
        }

        User user = new User();
        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setPhone(request.getPhone());
        user.setCollege(request.getCollege());
        user.setDegree(request.getDegree());
        user.setBranch(request.getBranch());
        user.setGraduationYear(request.getGraduationYear());
        user.setCgpa(request.getCgpa());
        user.setRole("ROLE_USER");
        user.setActive(true);

        User savedUser = userRepository.save(user);

        GamificationProgress progress = new GamificationProgress(savedUser);
        gamificationProgressRepository.save(progress);

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );
        SecurityContextHolder.getContext().setAuthentication(authentication);

        String jwt = tokenProvider.generateToken(authentication);

        return new JwtResponse(jwt, savedUser.getId(), savedUser.getFullName(), savedUser.getEmail(), savedUser.getRole());
    }

    public JwtResponse loginStudent(AuthRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        boolean isStudent = principal.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_USER"));

        if (!isStudent) {
            throw new BadCredentialsException("Invalid login credentials for Student Portal.");
        }

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = tokenProvider.generateToken(authentication);

        return new JwtResponse(jwt, principal.getId(), principal.getFullName(), principal.getEmail(), "ROLE_USER");
    }

    public JwtResponse loginAdmin(AuthRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        boolean isAdmin = principal.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        if (!isAdmin) {
            throw new BadCredentialsException("Access Denied: Account does not possess Administrator privileges.");
        }

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = tokenProvider.generateToken(authentication);

        return new JwtResponse(jwt, principal.getId(), principal.getFullName(), principal.getEmail(), "ROLE_ADMIN");
    }
}
