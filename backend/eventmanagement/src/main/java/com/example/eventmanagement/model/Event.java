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

    @Column(nullable = false)
    private String title;

    @Column(length = 3000)
    private String description;

    @Column(nullable = false)
    private String location;

    private String department;
    private String category;
    private String clubName;
    private String clubWebsite;

    // ── Single coordinator (legacy / simple) ───────────────────────────────────
    private String coordinatorName;
    private String coordinatorContact;

    // ── Multiple coordinators stored as JSON string ────────────────────────────
    // Format: [{"name":"Alice","contact":"9876543210"},{"name":"Bob","contact":"bob@college.edu"}]
    @Column(name = "coordinators_json", length = 2000)
    private String coordinatorsJson;

    // ── Dates ──────────────────────────────────────────────────────────────────
    @Column(name = "start_date")
    private LocalDateTime startDate;

    @Column(name = "end_date")
    private LocalDateTime endDate;

    @Column(name = "event_date")
    private LocalDateTime eventDate;   // legacy — kept in sync with startDate

    private LocalDateTime registrationDeadline;

    // ── Capacity ───────────────────────────────────────────────────────────────
    private Integer maxParticipants;

    // ── Fees / Prizes ──────────────────────────────────────────────────────────
    private Double  entryFee;
    private Double  prizePool;
    private String  goodies;

    // ── Approval workflow ──────────────────────────────────────────────────────
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EventStatus status = EventStatus.PENDING_FACULTY;

    @Column(length = 1000) private String facultyComment;
    @Column(length = 1000) private String sdwComment;
    @Column(length = 1000) private String hodComment;

    // ── Budget ─────────────────────────────────────────────────────────────────
    private Double estimatedBudget;
    private Double venueExpense;
    private Double foodExpense;
    private Double decorExpense;
    private Double printingExpense;
    private Double otherExpense;
    @Column(length = 1000) private String budgetNotes;

    // ── Post-event ─────────────────────────────────────────────────────────────
    @Column(length = 3000) private String eventReport;
    private Double actualExpenditure;
    @Column(length = 1000) private String reimbursementDetails;

    // ── Organizer ──────────────────────────────────────────────────────────────
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "organizer_id", nullable = false)
    @JsonIgnoreProperties({"password","hibernateLazyInitializer","handler"})
    private User organizer;

    // ── Timestamps ─────────────────────────────────────────────────────────────
    private LocalDateTime createdAt = LocalDateTime.now();

    // ═══════════════════════════════════════════════════════════════════════════
    // Getters & Setters
    // ═══════════════════════════════════════════════════════════════════════════
    public Long          getId()                              { return id; }
    public void          setId(Long id)                       { this.id = id; }
    public String        getTitle()                           { return title; }
    public void          setTitle(String v)                   { this.title = v; }
    public String        getDescription()                     { return description; }
    public void          setDescription(String v)             { this.description = v; }
    public String        getLocation()                        { return location; }
    public void          setLocation(String v)                { this.location = v; }
    public String        getDepartment()                      { return department; }
    public void          setDepartment(String v)              { this.department = v; }
    public String        getCategory()                        { return category; }
    public void          setCategory(String v)                { this.category = v; }
    public String        getClubName()                        { return clubName; }
    public void          setClubName(String v)                { this.clubName = v; }
    public String        getClubWebsite()                     { return clubWebsite; }
    public void          setClubWebsite(String v)             { this.clubWebsite = v; }
    public String        getCoordinatorName()                 { return coordinatorName; }
    public void          setCoordinatorName(String v)         { this.coordinatorName = v; }
    public String        getCoordinatorContact()              { return coordinatorContact; }
    public void          setCoordinatorContact(String v)      { this.coordinatorContact = v; }
    public String        getCoordinatorsJson()                { return coordinatorsJson; }
    public void          setCoordinatorsJson(String v)        { this.coordinatorsJson = v; }
    public LocalDateTime getStartDate()                       { return startDate; }
    public void          setStartDate(LocalDateTime v)        { this.startDate = v; }
    public LocalDateTime getEndDate()                         { return endDate; }
    public void          setEndDate(LocalDateTime v)          { this.endDate = v; }
    public LocalDateTime getEventDate()                       { return eventDate; }
    public void          setEventDate(LocalDateTime v)        { this.eventDate = v; }
    public LocalDateTime getRegistrationDeadline()            { return registrationDeadline; }
    public void          setRegistrationDeadline(LocalDateTime v){ this.registrationDeadline = v; }
    public Integer       getMaxParticipants()                 { return maxParticipants; }
    public void          setMaxParticipants(Integer v)        { this.maxParticipants = v; }
    public Double        getEntryFee()                        { return entryFee; }
    public void          setEntryFee(Double v)                { this.entryFee = v; }
    public Double        getPrizePool()                       { return prizePool; }
    public void          setPrizePool(Double v)               { this.prizePool = v; }
    public String        getGoodies()                         { return goodies; }
    public void          setGoodies(String v)                 { this.goodies = v; }
    public EventStatus   getStatus()                          { return status; }
    public void          setStatus(EventStatus v)             { this.status = v; }
    public String        getFacultyComment()                  { return facultyComment; }
    public void          setFacultyComment(String v)          { this.facultyComment = v; }
    public String        getSdwComment()                      { return sdwComment; }
    public void          setSdwComment(String v)              { this.sdwComment = v; }
    public String        getHodComment()                      { return hodComment; }
    public void          setHodComment(String v)              { this.hodComment = v; }
    public Double        getEstimatedBudget()                 { return estimatedBudget; }
    public void          setEstimatedBudget(Double v)         { this.estimatedBudget = v; }
    public Double        getVenueExpense()                    { return venueExpense; }
    public void          setVenueExpense(Double v)            { this.venueExpense = v; }
    public Double        getFoodExpense()                     { return foodExpense; }
    public void          setFoodExpense(Double v)             { this.foodExpense = v; }
    public Double        getDecorExpense()                    { return decorExpense; }
    public void          setDecorExpense(Double v)            { this.decorExpense = v; }
    public Double        getPrintingExpense()                 { return printingExpense; }
    public void          setPrintingExpense(Double v)         { this.printingExpense = v; }
    public Double        getOtherExpense()                    { return otherExpense; }
    public void          setOtherExpense(Double v)            { this.otherExpense = v; }
    public String        getBudgetNotes()                     { return budgetNotes; }
    public void          setBudgetNotes(String v)             { this.budgetNotes = v; }
    public String        getEventReport()                     { return eventReport; }
    public void          setEventReport(String v)             { this.eventReport = v; }
    public Double        getActualExpenditure()               { return actualExpenditure; }
    public void          setActualExpenditure(Double v)       { this.actualExpenditure = v; }
    public String        getReimbursementDetails()            { return reimbursementDetails; }
    public void          setReimbursementDetails(String v)    { this.reimbursementDetails = v; }
    public User          getOrganizer()                       { return organizer; }
    public void          setOrganizer(User organizer)         { this.organizer = organizer; }
    public LocalDateTime getCreatedAt()                       { return createdAt; }
    public void          setCreatedAt(LocalDateTime v)        { this.createdAt = v; }
}