package com.example.eventmanagement.controller;

import com.example.eventmanagement.model.Attendance;
import com.example.eventmanagement.service.AttendanceService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/attendance")
@CrossOrigin(origins = "http://localhost:5173")
public class AttendanceController {

    private final AttendanceService attendanceService;

    public AttendanceController(AttendanceService attendanceService) {
        this.attendanceService = attendanceService;
    }

    // POST /attendance?eventId=1&studentId=2&present=true
    @PostMapping
    public Attendance markAttendance(@RequestParam Long eventId,
                                     @RequestParam Long studentId,
                                     @RequestParam boolean present) {
        return attendanceService.markAttendance(eventId, studentId, present);
    }
}