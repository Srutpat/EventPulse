package com.example.eventmanagement.controller;

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
    public ResponseEntity<?> markAttendance(@RequestBody Map<String, Object> body) {
        try {
            // Parse registration id
            @SuppressWarnings("unchecked")
            Map<String, Object> regMap = (Map<String, Object>) body.get("registration");
            Long registrationId = Long.valueOf(regMap.get("id").toString());

            // Parse present
            boolean present = Boolean.parseBoolean(body.get("present").toString());

            // Parse markedBy id
            @SuppressWarnings("unchecked")
            Map<String, Object> markedByMap = (Map<String, Object>) body.get("markedBy");
            Long markedById = Long.valueOf(markedByMap.get("id").toString());

            Attendance att = attendanceService.markAttendance(registrationId, present, markedById);
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