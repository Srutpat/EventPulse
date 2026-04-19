package com.example.eventmanagement.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "events")
public class Event {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ── Basic Info ─────────────────────────────────────────────────────────────
    @Column(nullable = false)
    private String title;

    @Column(length = 3000)
    private String description;        // about/info

    @Column(nullable = false)
    private String location;           // venue

    private String department;         // null = central event
    private String category;
    private String clubName;
    private String clubDepartment;     // "central" or dept name
    private String clubWebsite;

    // ── Event type & theme ─────────────────────────────────────────────────────
    private String theme;              // optional
    private String eventType;          // "INDIVIDUAL" | "TEAM" | "BOTH"
    private String speakerName;        // optional
    @Column(length = 1000)
    private String speakerDetails;     // optional

    // ── Central event flag ─────────────────────────────────────────────────────
    private String isCentralEvent;     // "true" for NSS/central cells

    // ── Coordinators ──────────────────────────────────────────────────────────
    private String coordinatorName;
    private String coordinatorContact;
    @Column(name = "coordinators_json", length = 2000)
    private String coordinatorsJson;   // JSON array [{name, contact}]

    // ── Dates ─────────────────────────────────────────────────────────────────
    @Column(name = "start_date")
    private LocalDateTime startDate;

    @Column(name = "end_date")
    private LocalDateTime endDate;

    @Column(name = "event_date")
    private LocalDateTime eventDate;   // legacy

    private LocalDateTime registrationDeadline;

    // After HoD approval, organizer can choose when to make event live
    @Column(name = "go_live_date")
    private LocalDateTime goLiveDate;  // null = go live immediately after HoD approval

    // ── Capacity ──────────────────────────────────────────────────────────────
    private Integer maxParticipants;

    // ── Fees / Prizes ──────────────────────────────────────────────────────────
    private Double entryFee;           // optional (0 = free)
    private Double prizePool;          // optional
    private String goodies;            // optional

    // ── Budget (COMPULSORY per PDF — 0 if no budget) ──────────────────────────
    @Column(nullable = false)
    private Double estimatedBudget = 0.0;   // required, default 0
    private Double venueExpense;
    private Double foodExpense;
    private Double decorExpense;
    private Double printingExpense;
    private Double otherExpense;
    @Column(length = 1000)
    private String budgetNotes;

    // ── Status (plain String — resilient to old DB values) ───────────────────
    @Column(nullable = false)
    private String status = "PENDING_FACULTY";

    // ── Approval comments ─────────────────────────────────────────────────────
    @Column(length = 1000) private String facultyComment;
    @Column(length = 1000) private String sdwComment;
    @Column(length = 1000) private String hodComment;

    // ── Post-event ────────────────────────────────────────────────────────────
    @Column(length = 3000)
    private String eventReport;

    // Store report as base64 PDF or URL
    @Column(length = 5000)
    private String reportFileData;

    private String reportFileName;

    private Double actualExpenditure;

    @Column(length = 1000)
    private String reimbursementDetails;

    // ── Organizer ─────────────────────────────────────────────────────────────
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "organizer_id", nullable = false)
    @JsonIgnoreProperties({"password","hibernateLazyInitializer","handler"})
    private User organizer;

    private LocalDateTime createdAt = LocalDateTime.now();

    // ═══ Getters & Setters ════════════════════════════════════════════════════
    public Long   getId()                              { return id; }
    public void   setId(Long id)                       { this.id = id; }
    public String getTitle()                           { return title; }
    public void   setTitle(String v)                   { this.title = v; }
    public String getDescription()                     { return description; }
    public void   setDescription(String v)             { this.description = v; }
    public String getLocation()                        { return location; }
    public void   setLocation(String v)                { this.location = v; }
    public String getDepartment()                      { return department; }
    public void   setDepartment(String v)              { this.department = v; }
    public String getCategory()                        { return category; }
    public void   setCategory(String v)                { this.category = v; }
    public String getClubName()                        { return clubName; }
    public void   setClubName(String v)                { this.clubName = v; }
    public String getClubDepartment()                  { return clubDepartment; }
    public void   setClubDepartment(String v)          { this.clubDepartment = v; }
    public String getClubWebsite()                     { return clubWebsite; }
    public void   setClubWebsite(String v)             { this.clubWebsite = v; }
    public String getTheme()                           { return theme; }
    public void   setTheme(String v)                   { this.theme = v; }
    public String getEventType()                       { return eventType; }
    public void   setEventType(String v)               { this.eventType = v; }
    public String getSpeakerName()                     { return speakerName; }
    public void   setSpeakerName(String v)             { this.speakerName = v; }
    public String getSpeakerDetails()                  { return speakerDetails; }
    public void   setSpeakerDetails(String v)          { this.speakerDetails = v; }
    public String getIsCentralEvent()                  { return isCentralEvent; }
    public void   setIsCentralEvent(String v)          { this.isCentralEvent = v; }
    public String getCoordinatorName()                 { return coordinatorName; }
    public void   setCoordinatorName(String v)         { this.coordinatorName = v; }
    public String getCoordinatorContact()              { return coordinatorContact; }
    public void   setCoordinatorContact(String v)      { this.coordinatorContact = v; }
    public String getCoordinatorsJson()                { return coordinatorsJson; }
    public void   setCoordinatorsJson(String v)        { this.coordinatorsJson = v; }
    public LocalDateTime getStartDate()                { return startDate; }
    public void          setStartDate(LocalDateTime v) { this.startDate = v; }
    public LocalDateTime getEndDate()                  { return endDate; }
    public void          setEndDate(LocalDateTime v)   { this.endDate = v; }
    public LocalDateTime getEventDate()                { return eventDate; }
    public void          setEventDate(LocalDateTime v) { this.eventDate = v; }
    public LocalDateTime getRegistrationDeadline()     { return registrationDeadline; }
    public void setRegistrationDeadline(LocalDateTime v){ this.registrationDeadline = v; }
    public LocalDateTime getGoLiveDate()               { return goLiveDate; }
    public void          setGoLiveDate(LocalDateTime v){ this.goLiveDate = v; }
    public Integer getMaxParticipants()                { return maxParticipants; }
    public void    setMaxParticipants(Integer v)       { this.maxParticipants = v; }
    public Double  getEntryFee()                       { return entryFee; }
    public void    setEntryFee(Double v)               { this.entryFee = v; }
    public Double  getPrizePool()                      { return prizePool; }
    public void    setPrizePool(Double v)              { this.prizePool = v; }
    public String  getGoodies()                        { return goodies; }
    public void    setGoodies(String v)                { this.goodies = v; }
    public Double  getEstimatedBudget()                { return estimatedBudget; }
    public void    setEstimatedBudget(Double v)        { this.estimatedBudget = v; }
    public Double  getVenueExpense()                   { return venueExpense; }
    public void    setVenueExpense(Double v)           { this.venueExpense = v; }
    public Double  getFoodExpense()                    { return foodExpense; }
    public void    setFoodExpense(Double v)            { this.foodExpense = v; }
    public Double  getDecorExpense()                   { return decorExpense; }
    public void    setDecorExpense(Double v)           { this.decorExpense = v; }
    public Double  getPrintingExpense()                { return printingExpense; }
    public void    setPrintingExpense(Double v)        { this.printingExpense = v; }
    public Double  getOtherExpense()                   { return otherExpense; }
    public void    setOtherExpense(Double v)           { this.otherExpense = v; }
    public String  getBudgetNotes()                    { return budgetNotes; }
    public void    setBudgetNotes(String v)            { this.budgetNotes = v; }
    public String  getStatus()                         { return status; }
    public void    setStatus(String v)                 { this.status = v; }
    public String  getFacultyComment()                 { return facultyComment; }
    public void    setFacultyComment(String v)         { this.facultyComment = v; }
    public String  getSdwComment()                     { return sdwComment; }
    public void    setSdwComment(String v)             { this.sdwComment = v; }
    public String  getHodComment()                     { return hodComment; }
    public void    setHodComment(String v)             { this.hodComment = v; }
    public String  getEventReport()                    { return eventReport; }
    public void    setEventReport(String v)            { this.eventReport = v; }
    public String  getReportFileData()                 { return reportFileData; }
    public void    setReportFileData(String v)         { this.reportFileData = v; }
    public String  getReportFileName()                 { return reportFileName; }
    public void    setReportFileName(String v)         { this.reportFileName = v; }
    public Double  getActualExpenditure()              { return actualExpenditure; }
    public void    setActualExpenditure(Double v)      { this.actualExpenditure = v; }
    public String  getReimbursementDetails()           { return reimbursementDetails; }
    public void    setReimbursementDetails(String v)   { this.reimbursementDetails = v; }
    public User    getOrganizer()                      { return organizer; }
    public void    setOrganizer(User organizer)        { this.organizer = organizer; }
    public LocalDateTime getCreatedAt()                { return createdAt; }
    public void          setCreatedAt(LocalDateTime v) { this.createdAt = v; }
}