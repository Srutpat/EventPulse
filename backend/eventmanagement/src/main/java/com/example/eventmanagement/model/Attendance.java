package com.example.eventmanagement.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "attendance")
public class Attendance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
@JoinColumn(name = "registration_id", nullable = false, unique = true)
@JsonIgnoreProperties({"attendance", "student", "event"})  // ← ADD THIS
private Registration registration;

    @Column(nullable = false)
    private boolean present;

    @Column(nullable = false)
    private LocalDateTime markedAt = LocalDateTime.now();

    @ManyToOne(fetch = FetchType.EAGER)
@JoinColumn(name = "marked_by", nullable = false)
@JsonIgnoreProperties({"password"})                        // ← ADD THIS
private User markedBy;

    // ── Getters & Setters ─────────────────────────────────────────────────────
    public Long         getId()                           { return id; }
    public void         setId(Long id)                    { this.id = id; }

    public Registration getRegistration()                 { return registration; }
    public void         setRegistration(Registration v)   { this.registration = v; }

    public boolean      isPresent()                       { return present; }
    public void         setPresent(boolean v)             { this.present = v; }

    public LocalDateTime getMarkedAt()                    { return markedAt; }
    public void          setMarkedAt(LocalDateTime v)     { this.markedAt = v; }

    public User         getMarkedBy()                     { return markedBy; }
    public void         setMarkedBy(User v)               { this.markedBy = v; }
}