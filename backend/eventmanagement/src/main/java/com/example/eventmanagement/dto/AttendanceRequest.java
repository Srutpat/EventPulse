package com.example.eventmanagement.dto;

public class AttendanceRequest {
    private Long registrationId;
    private boolean present;
    private Long markedById;   // ✅ ADD THIS

    public Long getRegistrationId() { return registrationId; }
    public void setRegistrationId(Long registrationId) { this.registrationId = registrationId; }

    public boolean isPresent() { return present; }
    public void setPresent(boolean present) { this.present = present; }

    public Long getMarkedById() { return markedById; }
    public void setMarkedById(Long markedById) { this.markedById = markedById; }
}