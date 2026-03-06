// package com.example.eventmanagement.controller;

// import com.example.eventmanagement.model.User;
// import com.example.eventmanagement.repository.UserRepository;
// import org.springframework.web.bind.annotation.*;

// @RestController
// @RequestMapping("/auth")
// @CrossOrigin
// public class AuthController {

//     private final UserRepository userRepo;

//     public AuthController(UserRepository userRepo) {
//         this.userRepo = userRepo;
//     }

//     // Register user
//     @PostMapping("/register")
//     public User register(@RequestBody User user) {
//         return userRepo.save(user);
//     }

//     // Login user
//     @PostMapping("/login")
//     public User login(@RequestParam String email, @RequestParam String password) {
//         User user = userRepo.findByEmail(email)
//                 .orElseThrow(() -> new RuntimeException("User not found"));

//         if (!user.getPassword().equals(password)) {
//             throw new RuntimeException("Invalid password");
//         }

//         return user; // frontend stores id + role
//     }
// }


package com.example.eventmanagement.controller;

import com.example.eventmanagement.model.User;
import com.example.eventmanagement.repository.UserRepository;
import com.example.eventmanagement.service.*;
import org.springframework.web.bind.annotation.*;
import com.example.eventmanagement.dto.LoginRequest;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    private final UserRepository userRepository;

    private final AuthService authService;

    public AuthController(AuthService authService, UserRepository userRepository) {
        this.authService = authService;
        this.userRepository = userRepository;
    }

      @PostMapping("/register")
    public User register(@RequestBody User user) {
        return userRepository.save(user);
    }

    @PostMapping("/login")
    public User login(@RequestBody LoginRequest req) {
        return authService.login(req.getEmail(), req.getPassword());
    }
}