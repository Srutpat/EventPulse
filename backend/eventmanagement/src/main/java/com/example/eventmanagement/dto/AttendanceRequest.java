package com.example.eventmanagement.dto;

public class AttendanceRequest {
    private Long registrationId;
    private boolean present;

    public Long getRegistrationId() { return registrationId; }
    public void setRegistrationId(Long registrationId) { this.registrationId = registrationId; }

    public boolean isPresent() { return present; }
    public void setPresent(boolean present) { this.present = present; }
}