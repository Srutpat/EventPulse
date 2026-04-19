package com.example.eventmanagement.service;

import com.example.eventmanagement.dto.RegisterRequest;
import com.example.eventmanagement.model.Roles;
import com.example.eventmanagement.model.User;
import com.example.eventmanagement.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository  userRepo;
    private final PasswordEncoder encoder;

    public AuthService(UserRepository userRepo, PasswordEncoder encoder) {
        this.userRepo = userRepo;
        this.encoder  = encoder;
    }

    public User signup(RegisterRequest req) {
        if (userRepo.existsByEmail(req.getEmail()))
            throw new RuntimeException("Email already registered");
        if (req.getPrn() != null && !req.getPrn().isBlank() && userRepo.existsByPrn(req.getPrn()))
            throw new RuntimeException("PRN already registered");

        Roles role;
        try { role = Roles.valueOf(req.getRole().toUpperCase().trim()); }
        catch (Exception e) { role = Roles.STUDENT; }

        User user = new User();
        user.setName(req.getName());
        user.setEmail(req.getEmail());
        user.setPassword(encoder.encode(req.getPassword()));
        user.setRole(role);
        user.setMobileNumber(req.getMobileNumber());
        user.setDepartment(req.getDepartment());
        user.setPrn(req.getPrn());
        user.setYear(req.getYear());
        user.setDivision(req.getDivision());
        user.setClubName(req.getClubName());
        user.setClubDepartment(req.getClubDepartment());
        user.setSubject(req.getSubject());
        user.setSpecialization(req.getSpecialization());
        user.setClubNames(req.getClubNames());

        return userRepo.save(user);
    }

    public User login(String email, String password) {
        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (!encoder.matches(password, user.getPassword()))
            throw new RuntimeException("Invalid password");
        return user;
    }
}