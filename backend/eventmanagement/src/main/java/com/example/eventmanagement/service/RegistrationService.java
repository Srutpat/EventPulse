package com.example.eventmanagement.service;

import com.example.eventmanagement.model.Event;
import com.example.eventmanagement.model.Registration;
import com.example.eventmanagement.model.User;
import com.example.eventmanagement.repository.EventRepository;
import com.example.eventmanagement.repository.RegistrationRepository;
import com.example.eventmanagement.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RegistrationService {

    private final RegistrationRepository registrationRepository;
    private final EventRepository eventRepository;
    private final UserRepository userRepository;

    public RegistrationService(RegistrationRepository registrationRepository,
                               EventRepository eventRepository,
                               UserRepository userRepository) {
        this.registrationRepository = registrationRepository;
        this.eventRepository        = eventRepository;
        this.userRepository         = userRepository;
    }

    // ── REGISTER ─────────────────────────────────────────────────────────────
    public Registration register(Long studentId, Long eventId) {

        // Duplicate check
        if (registrationRepository.existsByStudentIdAndEventId(studentId, eventId)) {
            throw new RuntimeException("Already registered for this event");
        }

        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        Registration reg = new Registration();
        reg.setStudent(student);
        reg.setEvent(event);
        reg.setStatus("REGISTERED");   // plain String — matches DB USER-DEFINED type

        return registrationRepository.save(reg);
    }

    // ── GET BY STUDENT ────────────────────────────────────────────────────────
    public List<Registration> getByStudent(Long studentId) {
        return registrationRepository.findByStudentId(studentId);
    }

    // ── GET BY EVENT ──────────────────────────────────────────────────────────
    public List<Registration> getByEvent(Long eventId) {
        return registrationRepository.findByEventId(eventId);
    }
}