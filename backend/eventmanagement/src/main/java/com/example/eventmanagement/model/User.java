package com.example.eventmanagement.model;

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

    @Column(nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Roles role;

    private String department;

    @Column(unique = true)
    private String prn;

    private String year;       // "FE" | "SE" | "TE" | "BE" — stored as String

    private String division;

    // ── Getters & Setters ─────────────────────────────────────────────────────
    public Long   getId()                  { return id; }
    public void   setId(Long id)           { this.id = id; }

    public String getName()                { return name; }
    public void   setName(String v)        { this.name = v; }

    public String getEmail()               { return email; }
    public void   setEmail(String v)       { this.email = v; }

    public String getPassword()            { return password; }
    public void   setPassword(String v)    { this.password = v; }

    public Roles  getRole()                { return role; }
    public void   setRole(Roles v)         { this.role = v; }

    public String getDepartment()          { return department; }
    public void   setDepartment(String v)  { this.department = v; }

    public String getPrn()                 { return prn; }
    public void   setPrn(String v)         { this.prn = v; }

    public String getYear()                { return year; }
    public void   setYear(String v)        { this.year = v; }

    public String getDivision()            { return division; }
    public void   setDivision(String v)    { this.division = v; }
}