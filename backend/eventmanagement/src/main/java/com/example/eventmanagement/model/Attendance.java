package com.example.eventmanagement.model;

// package com.campus.eventmanagement.model;

import jakarta.persistence.*;

@Entity
@Table(name = "attendance")
public class Attendance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "student_id")
    private User student;

    @ManyToOne
    @JoinColumn(name = "event_id")
    private Event event;

    private boolean present;

    public Long getId(){ return id;}
    public void setId(Long id){this.id = id;}

    public User getStudent(){return student;}
    public void setStudent(User student){this.student = student;}

    public Event getEvent(){return event;}
    public void setEvent(Event event){this.event = event;}

    public boolean getPresent(){return present;}
    public void setPresent(boolean present){this.present = present;}

    // getters & setters
}