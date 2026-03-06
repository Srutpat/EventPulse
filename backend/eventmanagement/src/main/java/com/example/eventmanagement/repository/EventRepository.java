package com.example.eventmanagement.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

import com.example.eventmanagement.model.Event;
import com.example.eventmanagement.model.EventStatus;

public interface EventRepository extends JpaRepository<Event, Long> {

    // Fetch only approved events
    List<Event> findByStatus(EventStatus status);

    // Fetch events by organizer
    List<Event> findByOrganizerId(Long organizerId);

    // Fetch events by department
    List<Event> findByDepartment(String department);
}