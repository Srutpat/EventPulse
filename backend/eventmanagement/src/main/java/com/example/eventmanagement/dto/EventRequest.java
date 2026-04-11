package com.example.eventmanagement.dto;

import java.time.LocalDateTime;

public class EventRequest {
    private String        title;
    private String        description;
    private String        location;
    private String        department;
    private String        category;
    private String        clubName;
    private String        clubWebsite;
    private String        coordinatorName;
    private String        coordinatorContact;
    private String        coordinatorsJson;      // JSON array of {name, contact}
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private LocalDateTime registrationDeadline;
    private Integer       maxParticipants;
    private Long          organizerId;
    private Double        entryFee;
    private Double        prizePool;
    private String        goodies;
    private Double        estimatedBudget;
    private Double        venueExpense;
    private Double        foodExpense;
    private Double        decorExpense;
    private Double        printingExpense;
    private Double        otherExpense;
    private String        budgetNotes;

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
    public LocalDateTime getRegistrationDeadline()            { return registrationDeadline; }
    public void          setRegistrationDeadline(LocalDateTime v){ this.registrationDeadline = v; }
    public Integer       getMaxParticipants()                 { return maxParticipants; }
    public void          setMaxParticipants(Integer v)        { this.maxParticipants = v; }
    public Long          getOrganizerId()                     { return organizerId; }
    public void          setOrganizerId(Long v)               { this.organizerId = v; }
    public Double        getEntryFee()                        { return entryFee; }
    public void          setEntryFee(Double v)                { this.entryFee = v; }
    public Double        getPrizePool()                       { return prizePool; }
    public void          setPrizePool(Double v)               { this.prizePool = v; }
    public String        getGoodies()                         { return goodies; }
    public void          setGoodies(String v)                 { this.goodies = v; }
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
}