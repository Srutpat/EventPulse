package com.example.eventmanagement.controller;

import com.example.eventmanagement.dto.LoginRequest;
import com.example.eventmanagement.dto.RegisterRequest;
import com.example.eventmanagement.model.User;
import com.example.eventmanagement.config.JwtUtil;
import com.example.eventmanagement.service.AuthService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final AuthService authService;
    private final JwtUtil jwtUtil;

    public AuthController(AuthService authService, JwtUtil jwtUtil) {
        this.authService = authService;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody RegisterRequest req) {
        try {
            User user = authService.signup(req);
            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "message", "Signup successful",
                "userId",  user.getId(),
                "role",    user.getRole()
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest req) {
        try {
            User u = authService.login(req.getEmail(), req.getPassword());

            Map<String, Object> res = new HashMap<>();
            res.put("id",             u.getId());
            res.put("name",           u.getName());
            res.put("email",          u.getEmail());
            res.put("role",           u.getRole());
            res.put("mobileNumber",   u.getMobileNumber());
            res.put("department",     u.getDepartment());
            res.put("prn",            u.getPrn());
            res.put("year",           u.getYear());
            res.put("division",       u.getDivision());
            res.put("clubName",       u.getClubName());
            res.put("clubDepartment", u.getClubDepartment());
            res.put("clubNames",      u.getClubNames());  // for faculty
            res.put("subject",        u.getSubject());
            res.put("specialization", u.getSpecialization());

            // ✅ Generate JWT token
            String token = jwtUtil.generate(
                u.getId(),
                u.getEmail(),
                u.getRole().name()
            );

            res.put("token", token);

            return ResponseEntity.ok(res);

        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", e.getMessage()));
        }
    }
}