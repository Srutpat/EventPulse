package com.example.eventmanagement.dto;

public class RegisterRequest {
    private String name;
    private String email;
    private String password;
    private String role;
    private String department;
    private String prn;
    private String year;        // String: "FE" | "SE" | "TE" | "BE"
    private String division;

    public String getName()                { return name; }
    public void   setName(String v)        { this.name = v; }
    public String getEmail()               { return email; }
    public void   setEmail(String v)       { this.email = v; }
    public String getPassword()            { return password; }
    public void   setPassword(String v)    { this.password = v; }
    public String getRole()                { return role; }
    public void   setRole(String v)        { this.role = v; }
    public String getDepartment()          { return department; }
    public void   setDepartment(String v)  { this.department = v; }
    public String getPrn()                 { return prn; }
    public void   setPrn(String v)         { this.prn = v; }
    public String getYear()                { return year; }
    public void   setYear(String v)        { this.year = v; }
    public String getDivision()            { return division; }
    public void   setDivision(String v)    { this.division = v; }
}