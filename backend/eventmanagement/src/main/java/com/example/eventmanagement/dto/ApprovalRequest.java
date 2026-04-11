package com.example.eventmanagement.dto;

public class ApprovalRequest {
    private String action;   // "APPROVE" | "REJECT" | "REVERT"
    private String comment;  // required on reject/revert

    public String getAction()          { return action; }
    public void setAction(String v)    { this.action = v; }
    public String getComment()         { return comment; }
    public void setComment(String v)   { this.comment = v; }
}