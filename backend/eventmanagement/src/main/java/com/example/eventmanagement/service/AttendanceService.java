package com.example.eventmanagement.service;

import com.example.eventmanagement.model.Attendance;
import com.example.eventmanagement.model.Event;
import com.example.eventmanagement.model.User;
import com.example.eventmanagement.repository.AttendanceRepository;
import com.example.eventmanagement.repository.EventRepository;
import com.example.eventmanagement.repository.UserRepository;
import org.springframework.stereotype.Service;

@Service
public class AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final EventRepository eventRepository;
    private final UserRepository userRepository;

    public AttendanceService(AttendanceRepository attendanceRepository,
                             EventRepository eventRepository,
                             UserRepository userRepository) {
        this.attendanceRepository = attendanceRepository;
        this.eventRepository = eventRepository;
        this.userRepository = userRepository;
    }

    public Attendance markAttendance(Long eventId, Long studentId, boolean present) {
        Event event = eventRepository.findById(eventId).orElseThrow();
        User student = userRepository.findById(studentId).orElseThrow();

        Attendance att = new Attendance();
        att.setEvent(event);
        att.setStudent(student);
        att.setPresent(present);

        return attendanceRepository.save(att);
    }
}