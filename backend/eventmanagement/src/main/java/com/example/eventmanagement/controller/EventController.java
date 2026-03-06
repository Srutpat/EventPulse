package com.example.eventmanagement.controller;

import com.example.eventmanagement.dto.EventRequest;
import com.example.eventmanagement.model.Event;
import com.example.eventmanagement.service.EventService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/events")
@CrossOrigin(origins = "http://localhost:5173")
public class EventController {

    private final EventService eventService;

    public EventController(EventService eventService) {
        this.eventService = eventService;
    }

    // GET /events
    @GetMapping
    public List<Event> getAllEvents() {
        return eventService.getAllEvents();
    }

    // POST /events
    @PostMapping
    public Event createEvent(@RequestBody EventRequest request) {
        return eventService.createEvent(request);
    }

    @GetMapping("/approved")
public List<Event> getApprovedEvents() {
    return eventService.getApprovedEvents();
}
@PutMapping("/{id}/approve")
public Event approveEvent(@PathVariable Long id) {
    return eventService.approveEvent(id);
}
}