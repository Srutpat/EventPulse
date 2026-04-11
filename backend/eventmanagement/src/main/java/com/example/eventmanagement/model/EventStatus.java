package com.example.eventmanagement.model;

/**
 * Event lifecycle:
 * DRAFT → PENDING_FACULTY → FACULTY_APPROVED → PENDING_SDW → SDW_APPROVED → PENDING_HOD → APPROVED
 *                        ↘ FACULTY_REJECTED   ↘ SDW_REJECTED               ↘ HOD_REJECTED
 */
public enum EventStatus {
    DRAFT,
    PENDING_FACULTY,
    FACULTY_APPROVED,
    FACULTY_REJECTED,
    PENDING_SDW,
    SDW_APPROVED,
    SDW_REJECTED,
    PENDING_HOD,
    HOD_REJECTED,
    APPROVED           // visible to students
}