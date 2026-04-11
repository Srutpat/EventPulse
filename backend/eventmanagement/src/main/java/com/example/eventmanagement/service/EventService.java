package com.example.eventmanagement.service;

import com.example.eventmanagement.dto.ApprovalRequest;
import com.example.eventmanagement.dto.EventRequest;
import com.example.eventmanagement.dto.PostEventRequest;
import com.example.eventmanagement.model.*;
import com.example.eventmanagement.repository.*;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EventService {

    private final EventRepository eventRepo;
    private final UserRepository  userRepo;

    public EventService(EventRepository eventRepo, UserRepository userRepo) {
        this.eventRepo = eventRepo;
        this.userRepo  = userRepo;
    }

    public Event createEvent(EventRequest req) {
        User organizer = userRepo.findById(req.getOrganizerId())
                .orElseThrow(() -> new RuntimeException("Organizer not found"));
        Event event = applyRequest(new Event(), req);
        event.setOrganizer(organizer);
        event.setStatus(EventStatus.PENDING_FACULTY);
        return eventRepo.save(event);
    }

    public Event updateEvent(Long id, EventRequest req) {
        Event event = getById(id);
        // On edit+resubmit, go back to PENDING_FACULTY
        applyRequest(event, req);
        if (event.getStatus() == EventStatus.FACULTY_REJECTED
         || event.getStatus() == EventStatus.SDW_REJECTED
         || event.getStatus() == EventStatus.HOD_REJECTED) {
            event.setStatus(EventStatus.PENDING_FACULTY);
        }
        return eventRepo.save(event);
    }

    public void deleteEvent(Long id) {
        eventRepo.delete(getById(id));
    }

    public Event submitBudget(Long id, EventRequest req) {
        Event event = getById(id);
        if (event.getStatus() != EventStatus.FACULTY_APPROVED) {
            throw new RuntimeException("Budget can only be submitted after Faculty Advisor approves the event.");
        }
        event.setEstimatedBudget(req.getEstimatedBudget());
        event.setVenueExpense(req.getVenueExpense());
        event.setFoodExpense(req.getFoodExpense());
        event.setDecorExpense(req.getDecorExpense());
        event.setPrintingExpense(req.getPrintingExpense());
        event.setOtherExpense(req.getOtherExpense());
        event.setBudgetNotes(req.getBudgetNotes());
        event.setStatus(EventStatus.PENDING_SDW);
        return eventRepo.save(event);
    }

    public Event facultyReview(Long id, ApprovalRequest req) {
        Event event = getById(id);
        if (event.getStatus() != EventStatus.PENDING_FACULTY)
            throw new RuntimeException("Event is not awaiting Faculty review.");
        event.setFacultyComment(req.getComment());
        event.setStatus("APPROVE".equalsIgnoreCase(req.getAction())
                ? EventStatus.FACULTY_APPROVED : EventStatus.FACULTY_REJECTED);
        return eventRepo.save(event);
    }

    public Event sdwReview(Long id, ApprovalRequest req) {
        Event event = getById(id);
        if (event.getStatus() != EventStatus.PENDING_SDW)
            throw new RuntimeException("Event is not awaiting SDW review.");
        event.setSdwComment(req.getComment());
        event.setStatus("APPROVE".equalsIgnoreCase(req.getAction())
                ? EventStatus.SDW_APPROVED : EventStatus.SDW_REJECTED);
        return eventRepo.save(event);
    }

    public Event forwardToHod(Long id) {
        Event event = getById(id);
        if (event.getStatus() != EventStatus.SDW_APPROVED)
            throw new RuntimeException("Event must be SDW-approved before forwarding to HoD.");
        event.setStatus(EventStatus.PENDING_HOD);
        return eventRepo.save(event);
    }

    public Event hodReview(Long id, ApprovalRequest req) {
        Event event = getById(id);
        if (event.getStatus() != EventStatus.PENDING_HOD)
            throw new RuntimeException("Event is not awaiting HoD review.");
        event.setHodComment(req.getComment());
        event.setStatus("APPROVE".equalsIgnoreCase(req.getAction())
                ? EventStatus.APPROVED : EventStatus.HOD_REJECTED);
        return eventRepo.save(event);
    }

    public Event submitPostEventReport(Long id, PostEventRequest req) {
        Event event = getById(id);
        event.setEventReport(req.getEventReport());
        event.setActualExpenditure(req.getActualExpenditure());
        event.setReimbursementDetails(req.getReimbursementDetails());
        return eventRepo.save(event);
    }

    // ── Queries ───────────────────────────────────────────────────────────────
    public Event         getById(Long id)       { return eventRepo.findById(id).orElseThrow(() -> new RuntimeException("Event not found: " + id)); }
    public List<Event>   getAllEvents()          { return eventRepo.findAllByOrderByCreatedAtDesc(); }
    public List<Event>   getApprovedEvents()    { return eventRepo.findByStatus(EventStatus.APPROVED); }
    public List<Event>   getPendingFaculty()    { return eventRepo.findByStatus(EventStatus.PENDING_FACULTY); }
    public List<Event>   getPendingSdw()        { return eventRepo.findByStatus(EventStatus.PENDING_SDW); }
    public List<Event>   getPendingHod()        { return eventRepo.findByStatus(EventStatus.PENDING_HOD); }
    public List<Event>   getByOrganizer(Long id){ return eventRepo.findByOrganizerIdOrderByCreatedAtDesc(id); }

    // ── Helper ────────────────────────────────────────────────────────────────
    private Event applyRequest(Event e, EventRequest req) {
        e.setTitle(req.getTitle());
        e.setDescription(req.getDescription());
        e.setLocation(req.getLocation());
        e.setDepartment(req.getDepartment());
        e.setCategory(req.getCategory());
        e.setClubName(req.getClubName());
        e.setClubWebsite(req.getClubWebsite());
        e.setCoordinatorName(req.getCoordinatorName());
        e.setCoordinatorContact(req.getCoordinatorContact());
        e.setCoordinatorsJson(req.getCoordinatorsJson());
        e.setStartDate(req.getStartDate());
        e.setEndDate(req.getEndDate());
        e.setEventDate(req.getStartDate());           // keep legacy in sync
        e.setRegistrationDeadline(req.getRegistrationDeadline());
        e.setMaxParticipants(req.getMaxParticipants());
        e.setEntryFee(req.getEntryFee());
        e.setPrizePool(req.getPrizePool());
        e.setGoodies(req.getGoodies());
        if (req.getEstimatedBudget() != null) e.setEstimatedBudget(req.getEstimatedBudget());
        if (req.getVenueExpense()    != null) e.setVenueExpense(req.getVenueExpense());
        if (req.getFoodExpense()     != null) e.setFoodExpense(req.getFoodExpense());
        if (req.getDecorExpense()    != null) e.setDecorExpense(req.getDecorExpense());
        if (req.getPrintingExpense() != null) e.setPrintingExpense(req.getPrintingExpense());
        if (req.getOtherExpense()    != null) e.setOtherExpense(req.getOtherExpense());
        if (req.getBudgetNotes()     != null) e.setBudgetNotes(req.getBudgetNotes());
        return e;
    }
}