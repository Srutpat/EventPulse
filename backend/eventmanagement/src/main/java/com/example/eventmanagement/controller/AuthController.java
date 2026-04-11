package com.example.eventmanagement.controller;

import com.example.eventmanagement.dto.LoginRequest;
import com.example.eventmanagement.dto.RegisterRequest;
import com.example.eventmanagement.model.User;
import com.example.eventmanagement.service.AuthService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody RegisterRequest req) {
        try {
            User user = authService.signup(req);
            Map<String, Object> res = new HashMap<>();
            res.put("message", "Signup successful");
            res.put("userId",  user.getId());
            res.put("role",    user.getRole());
            return ResponseEntity.status(HttpStatus.CREATED).body(res);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest req) {
        try {
            User user = authService.login(req.getEmail(), req.getPassword());
            Map<String, Object> res = new HashMap<>();
            res.put("id",         user.getId());
            res.put("name",       user.getName());
            res.put("email",      user.getEmail());
            res.put("role",       user.getRole());           // returns enum name e.g. "FACULTY_ADVISOR"
            res.put("department", user.getDepartment());
            res.put("prn",        user.getPrn());
            res.put("year",       user.getYear());
            res.put("division",   user.getDivision());
            return ResponseEntity.ok(res);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", e.getMessage()));
        }
    }
}