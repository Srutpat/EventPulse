package com.example.eventmanagement.repository;

import com.example.eventmanagement.model.Registration;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface RegistrationRepository extends JpaRepository<Registration, Long> {
    List<Registration> findByStudentId(Long studentId);
    List<Registration> findByEventId(Long eventId);                        // ✅ returns List, not Page
    boolean existsByStudentIdAndEventId(Long studentId, Long eventId);
    int countByEventId(Long eventId);
}