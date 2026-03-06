package com.example.eventmanagement.controller;

import com.example.eventmanagement.model.Registration;
import com.example.eventmanagement.service.RegistrationService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/registrations")
@CrossOrigin(origins = "http://localhost:5173")
public class RegistrationController {

    private final RegistrationService registrationService;

    public RegistrationController(RegistrationService registrationService) {
        this.registrationService = registrationService;
    }

    @PostMapping
    public Registration register(@RequestParam Long userId, @RequestParam Long eventId) {
        return registrationService.register(userId, eventId);
    }
}