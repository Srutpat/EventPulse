package com.example.eventmanagement.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "registrations")
public class Registration {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Break circular: student → registrations → student
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "student_id", nullable = false)
    @JsonIgnoreProperties({"password", "hibernateLazyInitializer", "handler"})
    private User student;

    // Break circular: event → registrations → event → organizer → ...
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "event_id", nullable = false)
    @JsonIgnoreProperties({
        "organizer",          // don't recurse into organizer's events
        "hibernateLazyInitializer", "handler"
    })
    private Event event;

    // Break circular: attendance → registration → attendance
    @OneToOne(mappedBy = "registration", fetch = FetchType.EAGER)
    @JsonIgnoreProperties({"registration", "hibernateLazyInitializer", "handler"})
    private Attendance attendance;

    @Column(nullable = false)
    private String status = "REGISTERED";   // plain String — matches DB USER-DEFINED type

    @Column(nullable = false)
    private LocalDateTime registeredAt = LocalDateTime.now();

    // Getters & Setters
    public Long          getId()                           { return id; }
    public void          setId(Long id)                    { this.id = id; }
    public User          getStudent()                      { return student; }
    public void          setStudent(User v)                { this.student = v; }
    public Event         getEvent()                        { return event; }
    public void          setEvent(Event v)                 { this.event = v; }
    public Attendance    getAttendance()                   { return attendance; }
    public void          setAttendance(Attendance v)       { this.attendance = v; }
    public String        getStatus()                       { return status; }
    public void          setStatus(String v)               { this.status = v; }
    public LocalDateTime getRegisteredAt()                 { return registeredAt; }
    public void          setRegisteredAt(LocalDateTime v)  { this.registeredAt = v; }
}