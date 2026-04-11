package com.example.eventmanagement.controller;

import com.example.eventmanagement.dto.ApprovalRequest;
import com.example.eventmanagement.dto.EventRequest;
import com.example.eventmanagement.dto.PostEventRequest;
import com.example.eventmanagement.model.Event;
import com.example.eventmanagement.service.EventService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/events")
@CrossOrigin(origins = "http://localhost:5173")
public class EventController {

    private final EventService eventService;
    public EventController(EventService eventService) { this.eventService = eventService; }

    // ── Basic CRUD ────────────────────────────────────────────────────────────

    @GetMapping
    public ResponseEntity<List<Event>> getAll() {
        return ResponseEntity.ok(eventService.getAllEvents());
    }

    @GetMapping("/approved")
    public ResponseEntity<List<Event>> getApproved() {
        return ResponseEntity.ok(eventService.getApprovedEvents());
    }

    @GetMapping("/pending/faculty")
    public ResponseEntity<List<Event>> getPendingFaculty() {
        return ResponseEntity.ok(eventService.getPendingFaculty());
    }

    @GetMapping("/pending/sdw")
    public ResponseEntity<List<Event>> getPendingSdw() {
        return ResponseEntity.ok(eventService.getPendingSdw());
    }

    @GetMapping("/pending/hod")
    public ResponseEntity<List<Event>> getPendingHod() {
        return ResponseEntity.ok(eventService.getPendingHod());
    }

    @GetMapping("/organizer/{organizerId}")
    public ResponseEntity<List<Event>> getByOrganizer(@PathVariable Long organizerId) {
        return ResponseEntity.ok(eventService.getByOrganizer(organizerId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable Long id) {
        try { return ResponseEntity.ok(eventService.getById(id)); }
        catch (RuntimeException e) { return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage()); }
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody EventRequest req) {
        try { return ResponseEntity.status(HttpStatus.CREATED).body(eventService.createEvent(req)); }
        catch (RuntimeException e) { return ResponseEntity.badRequest().body(e.getMessage()); }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody EventRequest req) {
        try { return ResponseEntity.ok(eventService.updateEvent(id, req)); }
        catch (RuntimeException e) { return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage()); }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        try { eventService.deleteEvent(id); return ResponseEntity.ok("Deleted"); }
        catch (RuntimeException e) { return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage()); }
    }

    // ── Budget submission (organizer, post-faculty-approval) ──────────────────

    @PostMapping("/{id}/budget")
    public ResponseEntity<?> submitBudget(@PathVariable Long id, @RequestBody EventRequest req) {
        try { return ResponseEntity.ok(eventService.submitBudget(id, req)); }
        catch (RuntimeException e) { return ResponseEntity.badRequest().body(e.getMessage()); }
    }

    // ── Approval workflow ─────────────────────────────────────────────────────

    @PostMapping("/{id}/faculty-review")
    public ResponseEntity<?> facultyReview(@PathVariable Long id, @RequestBody ApprovalRequest req) {
        try { return ResponseEntity.ok(eventService.facultyReview(id, req)); }
        catch (RuntimeException e) { return ResponseEntity.badRequest().body(e.getMessage()); }
    }

    @PostMapping("/{id}/sdw-review")
    public ResponseEntity<?> sdwReview(@PathVariable Long id, @RequestBody ApprovalRequest req) {
        try { return ResponseEntity.ok(eventService.sdwReview(id, req)); }
        catch (RuntimeException e) { return ResponseEntity.badRequest().body(e.getMessage()); }
    }

    @PostMapping("/{id}/forward-hod")
    public ResponseEntity<?> forwardToHod(@PathVariable Long id) {
        try { return ResponseEntity.ok(eventService.forwardToHod(id)); }
        catch (RuntimeException e) { return ResponseEntity.badRequest().body(e.getMessage()); }
    }

    @PostMapping("/{id}/hod-review")
    public ResponseEntity<?> hodReview(@PathVariable Long id, @RequestBody ApprovalRequest req) {
        try { return ResponseEntity.ok(eventService.hodReview(id, req)); }
        catch (RuntimeException e) { return ResponseEntity.badRequest().body(e.getMessage()); }
    }

    // ── Post-event report ─────────────────────────────────────────────────────

    @PostMapping("/{id}/post-event")
    public ResponseEntity<?> postEventReport(@PathVariable Long id, @RequestBody PostEventRequest req) {
        try { return ResponseEntity.ok(eventService.submitPostEventReport(id, req)); }
        catch (RuntimeException e) { return ResponseEntity.badRequest().body(e.getMessage()); }
    }
}