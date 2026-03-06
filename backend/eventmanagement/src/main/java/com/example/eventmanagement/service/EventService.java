package com.example.eventmanagement.service;
import org.springframework.stereotype.Service;
import java.util.List;
import com.example.eventmanagement.dto.EventRequest;
import com.example.eventmanagement.model.*;
import com.example.eventmanagement.repository.*;

@Service
public class EventService {

    private final EventRepository eventRepository;
    private final ClubRepository clubRepository;
    private final UserRepository userRepository;

    public EventService(EventRepository eventRepository,
                        ClubRepository clubRepository,
                        UserRepository userRepository) {
        this.eventRepository = eventRepository;
        this.clubRepository = clubRepository;
        this.userRepository = userRepository;
    }

    public Event createEvent(EventRequest request) {

    Event event = new Event();

    event.setTitle(request.getTitle());
    event.setDescription(request.getDescription());
    event.setLocation(request.getLocation());
    event.setDepartment(request.getDepartment());
    event.setCategory(request.getCategory());
    event.setEventDate(request.getEventDate());
    event.setRegistrationDeadline(request.getRegistrationDeadline());

    event.setStatus(EventStatus.PENDING_APPROVAL);

    event.setOrganizer(
        userRepository.findById(request.getOrganizerId())
            .orElseThrow(() -> new RuntimeException("Organizer not found"))
    );

    event.setClub(
        clubRepository.findById(request.getClubId())
            .orElseThrow(() -> new RuntimeException("Club not found"))
    );

    return eventRepository.save(event);
}

public List<Event> getAllEvents() {
    return eventRepository.findAll();
}

public List<Event> getApprovedEvents() {
    return eventRepository.findByStatus(EventStatus.APPROVED);
}

public Event approveEvent(Long eventId) {
    Event event = eventRepository.findById(eventId)
            .orElseThrow(() -> new RuntimeException("Event not found"));

    event.setStatus(EventStatus.APPROVED);
    return eventRepository.save(event);
}
}