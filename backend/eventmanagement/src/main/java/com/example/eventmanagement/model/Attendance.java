package com.example.eventmanagement.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "attendance")
public class Attendance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Break: attendance → registration → attendance
    @OneToOne
    @JoinColumn(name = "registration_id", nullable = false, unique = true)
    @JsonIgnoreProperties({
        "attendance",         // stop: registration.attendance back to this
        "event",              // stop: registration.event.organizer...
        "hibernateLazyInitializer", "handler"
    })
    private Registration registration;

    @Column(nullable = false)
    private boolean present;

    @Column(nullable = false)
    private LocalDateTime markedAt = LocalDateTime.now();

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "marked_by", nullable = false)
    @JsonIgnoreProperties({"password", "hibernateLazyInitializer", "handler"})
    private User markedBy;

    // Getters & Setters
    public Long          getId()                           { return id; }
    public void          setId(Long id)                    { this.id = id; }
    public Registration  getRegistration()                 { return registration; }
    public void          setRegistration(Registration v)   { this.registration = v; }
    public boolean       isPresent()                       { return present; }
    public void          setPresent(boolean v)             { this.present = v; }
    public LocalDateTime getMarkedAt()                     { return markedAt; }
    public void          setMarkedAt(LocalDateTime v)      { this.markedAt = v; }
    public User          getMarkedBy()                     { return markedBy; }
    public void          setMarkedBy(User v)               { this.markedBy = v; }
}