package com.example.eventmanagement.dto;

public class PostEventRequest {
    private String eventReport;
    private Double actualExpenditure;
    private String reimbursementDetails;

    public String getEventReport()                 { return eventReport; }
    public void setEventReport(String v)           { this.eventReport = v; }
    public Double getActualExpenditure()           { return actualExpenditure; }
    public void setActualExpenditure(Double v)     { this.actualExpenditure = v; }
    public String getReimbursementDetails()        { return reimbursementDetails; }
    public void setReimbursementDetails(String v)  { this.reimbursementDetails = v; }
}