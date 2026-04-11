package com.example.eventmanagement.controller;

import com.example.eventmanagement.model.Event;
import com.example.eventmanagement.model.Registration;
import com.example.eventmanagement.model.User;
import com.example.eventmanagement.repository.EventRepository;
import com.example.eventmanagement.repository.RegistrationRepository;
import com.example.eventmanagement.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/registrations")
@CrossOrigin(origins = "http://localhost:5173")
public class RegistrationController {

    private final RegistrationRepository regRepo;
    private final UserRepository         userRepo;
    private final EventRepository        eventRepo;

    public RegistrationController(RegistrationRepository regRepo,
                                  UserRepository userRepo,
                                  EventRepository eventRepo) {
        this.regRepo   = regRepo;
        this.userRepo  = userRepo;
        this.eventRepo = eventRepo;
    }

    // ── REGISTER ──────────────────────────────────────────────────────────────
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestParam Long studentId,
                                      @RequestParam Long eventId) {
        try {
            // Duplicate check
            if (regRepo.existsByStudentIdAndEventId(studentId, eventId)) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(Map.of("error", "Already registered for this event"));
            }

            User  student = userRepo.findById(studentId)
                    .orElseThrow(() -> new RuntimeException("Student not found"));
            Event event   = eventRepo.findById(eventId)
                    .orElseThrow(() -> new RuntimeException("Event not found"));

            // Registration deadline check
            if (event.getRegistrationDeadline() != null
                    && LocalDateTime.now().isAfter(event.getRegistrationDeadline())) {
                return ResponseEntity.status(HttpStatus.GONE)
                        .body(Map.of("error", "Registration deadline has passed"));
            }

            // Capacity check
            if (event.getMaxParticipants() != null
                    && regRepo.countByEventId(eventId) >= event.getMaxParticipants()) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(Map.of("error", "Event is full"));
            }

            Registration reg = new Registration();
            reg.setStudent(student);
            reg.setEvent(event);
            reg.setStatus("REGISTERED");

            return ResponseEntity.status(HttpStatus.CREATED).body(regRepo.save(reg));

        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ── GET BY STUDENT ────────────────────────────────────────────────────────
    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<Registration>> getByStudent(@PathVariable Long studentId) {
        return ResponseEntity.ok(regRepo.findByStudentId(studentId));
    }

    // ── GET BY EVENT (always List) ────────────────────────────────────────────
    @GetMapping("/event/{eventId}")
    public ResponseEntity<List<Registration>> getByEvent(@PathVariable Long eventId) {
        return ResponseEntity.ok(regRepo.findByEventId(eventId));   // ✅ List, never Page/Map
    }

    // ── COUNT BY EVENT ────────────────────────────────────────────────────────
    @GetMapping("/event/{eventId}/count")
    public ResponseEntity<Map<String, Integer>> countByEvent(@PathVariable Long eventId) {
        return ResponseEntity.ok(Map.of("count", regRepo.countByEventId(eventId)));
    }
    @DeleteMapping("/{id}")
public ResponseEntity<?> deleteRegistration(@PathVariable Long id) {
    regRepo.deleteById(id);
    return ResponseEntity.ok(Map.of("message", "Registration cancelled"));
}
}