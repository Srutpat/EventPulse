package com.example.eventmanagement.repository;

import com.example.eventmanagement.model.Event;
import com.example.eventmanagement.model.EventStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface EventRepository extends JpaRepository<Event, Long> {
    List<Event> findByStatus(EventStatus status);
    List<Event> findByStatusIn(List<EventStatus> statuses);
    List<Event> findByOrganizerId(Long organizerId);
    List<Event> findByOrganizerIdOrderByCreatedAtDesc(Long organizerId);
    List<Event> findAllByOrderByCreatedAtDesc();
}