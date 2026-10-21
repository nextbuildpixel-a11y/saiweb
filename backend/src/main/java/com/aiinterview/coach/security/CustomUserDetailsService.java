package com.aiinterview.coach.security;

import com.aiinterview.coach.entity.Admin;
import com.aiinterview.coach.entity.User;
import com.aiinterview.coach.repository.AdminRepository;
import com.aiinterview.coach.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AdminRepository adminRepository;

    @Override
    @Transactional
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        // First check Student User repository
        Optional<User> user = userRepository.findByEmail(email);
        if (user.isPresent()) {
            return UserPrincipal.create(user.get());
        }

        // Next check Admin repository
        Optional<Admin> admin = adminRepository.findByEmail(email);
        if (admin.isPresent()) {
            return UserPrincipal.create(admin.get());
        }

        throw new UsernameNotFoundException("User not found with email: " + email);
    }
}
