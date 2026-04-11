package com.example.eventmanagement.repository;

import com.example.eventmanagement.model.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
    Optional<Attendance> findByRegistrationId(Long registrationId);
    List<Attendance>     findByRegistration_Event_Id(Long eventId);   // ✅ correct Spring Data method
}