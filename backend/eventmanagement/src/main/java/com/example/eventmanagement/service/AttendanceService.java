package com.example.eventmanagement.service;

import com.example.eventmanagement.model.Attendance;
import com.example.eventmanagement.model.Registration;
import com.example.eventmanagement.model.User;
import com.example.eventmanagement.repository.AttendanceRepository;
import com.example.eventmanagement.repository.RegistrationRepository;
import com.example.eventmanagement.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class AttendanceService {

    private final AttendanceRepository    attendanceRepo;
    private final RegistrationRepository  registrationRepo;
    private final UserRepository          userRepo;

    public AttendanceService(AttendanceRepository attendanceRepo,
                             RegistrationRepository registrationRepo,
                             UserRepository userRepo) {
        this.attendanceRepo   = attendanceRepo;
        this.registrationRepo = registrationRepo;
        this.userRepo         = userRepo;
    }

    /**
     * Mark or update attendance for a single registration.
     * If an attendance record already exists, it updates it.
     */
    public Attendance markAttendance(Long registrationId, boolean present, Long markedById) {
        Registration reg = registrationRepo.findById(registrationId)
                .orElseThrow(() -> new RuntimeException("Registration not found: " + registrationId));

        User markedBy = userRepo.findById(markedById)
                .orElseThrow(() -> new RuntimeException("User not found: " + markedById));

        Optional<Attendance> existing = attendanceRepo.findByRegistrationId(registrationId);

        Attendance att = existing.orElse(new Attendance());
        att.setRegistration(reg);
        att.setPresent(present);
        att.setMarkedBy(markedBy);
        att.setMarkedAt(LocalDateTime.now());

        return attendanceRepo.save(att);
    }

    /** Get all attendance records for an event */
    public List<Attendance> getByEvent(Long eventId) {
        return attendanceRepo.findByRegistration_Event_Id(eventId);
    }
}