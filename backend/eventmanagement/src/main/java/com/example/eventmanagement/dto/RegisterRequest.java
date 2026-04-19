package com.example.eventmanagement.dto;

public class RegisterRequest {
    private String name;
    private String email;
    private String password;
    private String role;
    private String mobileNumber;
    private String department;
    // Student
    private String prn;
    private String year;
    private String division;
    // Organizer
    private String clubName;
    private String clubDepartment;  // "central" or dept name
    // Faculty/SDW/HoD
    private String subject;
    private String specialization;
    private String clubNames;       // comma-separated for faculty multiple clubs

    public String getName()                    { return name; }
    public void   setName(String v)            { this.name = v; }
    public String getEmail()                   { return email; }
    public void   setEmail(String v)           { this.email = v; }
    public String getPassword()                { return password; }
    public void   setPassword(String v)        { this.password = v; }
    public String getRole()                    { return role; }
    public void   setRole(String v)            { this.role = v; }
    public String getMobileNumber()            { return mobileNumber; }
    public void   setMobileNumber(String v)    { this.mobileNumber = v; }
    public String getDepartment()              { return department; }
    public void   setDepartment(String v)      { this.department = v; }
    public String getPrn()                     { return prn; }
    public void   setPrn(String v)             { this.prn = v; }
    public String getYear()                    { return year; }
    public void   setYear(String v)            { this.year = v; }
    public String getDivision()                { return division; }
    public void   setDivision(String v)        { this.division = v; }
    public String getClubName()                { return clubName; }
    public void   setClubName(String v)        { this.clubName = v; }
    public String getClubDepartment()          { return clubDepartment; }
    public void   setClubDepartment(String v)  { this.clubDepartment = v; }
    public String getSubject()                 { return subject; }
    public void   setSubject(String v)         { this.subject = v; }
    public String getSpecialization()          { return specialization; }
    public void   setSpecialization(String v)  { this.specialization = v; }
    public String getClubNames()               { return clubNames; }
    public void   setClubNames(String v)       { this.clubNames = v; }
}