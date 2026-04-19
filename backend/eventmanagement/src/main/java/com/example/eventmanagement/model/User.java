package com.example.eventmanagement.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(unique = true, nullable = false)
    private String email;

    @JsonIgnore
    @Column(nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Roles role;

    // ── Common fields ──────────────────────────────────────────────────────────
    private String mobileNumber;
    private String department;    // user's own department

    // ── Student fields ─────────────────────────────────────────────────────────
    @Column(unique = true)
    private String prn;
    private String year;       // FE/SE/TE/BE
    private String division;

    // ── Organizer fields ───────────────────────────────────────────────────────
    private String clubName;           // primary club
    private String clubDepartment;     // "central" or specific dept

    // ── Faculty / SDW / HoD fields ─────────────────────────────────────────────
    private String subject;
    private String specialization;

    // Faculty can advise MULTIPLE clubs — stored as comma-separated
    // e.g. "Tech Club,NSS" — use getClubNamesAsList() helper
    @Column(name = "club_names")
    private String clubNames;

    // ── Getters & Setters ──────────────────────────────────────────────────────
    public Long   getId()                     { return id; }
    public void   setId(Long id)              { this.id = id; }
    public String getName()                   { return name; }
    public void   setName(String v)           { this.name = v; }
    public String getEmail()                  { return email; }
    public void   setEmail(String v)          { this.email = v; }
    public String getPassword()               { return password; }
    public void   setPassword(String v)       { this.password = v; }
    public Roles  getRole()                   { return role; }
    public void   setRole(Roles v)            { this.role = v; }
    public String getMobileNumber()           { return mobileNumber; }
    public void   setMobileNumber(String v)   { this.mobileNumber = v; }
    public String getDepartment()             { return department; }
    public void   setDepartment(String v)     { this.department = v; }
    public String getPrn()                    { return prn; }
    public void   setPrn(String v)            { this.prn = v; }
    public String getYear()                   { return year; }
    public void   setYear(String v)           { this.year = v; }
    public String getDivision()               { return division; }
    public void   setDivision(String v)       { this.division = v; }
    public String getClubName()               { return clubName; }
    public void   setClubName(String v)       { this.clubName = v; }
    public String getClubDepartment()         { return clubDepartment; }
    public void   setClubDepartment(String v) { this.clubDepartment = v; }
    public String getSubject()                { return subject; }
    public void   setSubject(String v)        { this.subject = v; }
    public String getSpecialization()         { return specialization; }
    public void   setSpecialization(String v) { this.specialization = v; }
    public String getClubNames()              { return clubNames; }
    public void   setClubNames(String v)      { this.clubNames = v; }
}