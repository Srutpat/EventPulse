package com.example.eventmanagement.controller;

import com.example.eventmanagement.dto.AttendanceRequest;
import com.example.eventmanagement.model.Attendance;
import com.example.eventmanagement.service.AttendanceService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/attendance")
@CrossOrigin(origins = "http://localhost:5173")
public class AttendanceController {

    private final AttendanceService attendanceService;

    public AttendanceController(AttendanceService attendanceService) {
        this.attendanceService = attendanceService;
    }

    /**
     * POST /attendance/mark
     * Body: { "registration": {"id": 1}, "present": true, "markedBy": {"id": 5} }
     */
    @PostMapping("/mark")
public ResponseEntity<?> markAttendance(@RequestBody AttendanceRequest req) {
    try {
        Attendance att = attendanceService.markAttendance(
            req.getRegistrationId(),
            req.isPresent(),
            req.getMarkedById()
        );
        return ResponseEntity.ok(att);

    } catch (Exception e) {
        return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
    }
}

    /**
     * GET /attendance/event/{eventId}
     * Returns all attendance records for an event (for faculty/reports)
     */
    @GetMapping("/event/{eventId}")
    public ResponseEntity<List<Attendance>> getByEvent(@PathVariable Long eventId) {
        return ResponseEntity.ok(attendanceService.getByEvent(eventId));
    }
}