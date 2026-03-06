package com.example.eventmanagement.service;

import com.example.eventmanagement.model.User;
import com.example.eventmanagement.repository.UserRepository;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;

    public AuthService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User login(String email, String password) {
    email = email.trim().toLowerCase();
    password = password.trim();

    User user = userRepository.findByEmail(email)
        .orElseThrow(() -> new RuntimeException("Invalid username or password"));

    System.out.println("DB PASSWORD=[" + user.getPassword() + "]");

    if (!user.getPassword().equals(password)) {
        throw new RuntimeException("Invalid username or password");
    }

    return user;
}
}