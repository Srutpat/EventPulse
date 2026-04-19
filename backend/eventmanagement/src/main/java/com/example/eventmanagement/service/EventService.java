package com.example.eventmanagement.service;

import com.example.eventmanagement.dto.ApprovalRequest;
import com.example.eventmanagement.dto.EventRequest;
import com.example.eventmanagement.dto.PostEventRequest;
import com.example.eventmanagement.model.Event;
import com.example.eventmanagement.model.User;
import com.example.eventmanagement.repository.EventRepository;
import com.example.eventmanagement.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class EventService {

    public static final String PENDING_FACULTY  = "PENDING_FACULTY";
    public static final String FACULTY_APPROVED = "FACULTY_APPROVED";
    public static final String FACULTY_REJECTED = "FACULTY_REJECTED";
    public static final String PENDING_SDW      = "PENDING_SDW";
    public static final String SDW_APPROVED     = "SDW_APPROVED";
    public static final String SDW_REJECTED     = "SDW_REJECTED";
    public static final String PENDING_HOD      = "PENDING_HOD";
    public static final String HOD_REJECTED     = "HOD_REJECTED";
    public static final String APPROVED         = "APPROVED";

    private final EventRepository eventRepo;
    private final UserRepository  userRepo;

    public EventService(EventRepository eventRepo, UserRepository userRepo) {
        this.eventRepo = eventRepo;
        this.userRepo  = userRepo;
    }

    // ── CREATE ────────────────────────────────────────────────────────────────
    public Event createEvent(EventRequest req) {
        User organizer = userRepo.findById(req.getOrganizerId())
                .orElseThrow(() -> new RuntimeException("Organizer not found"));

        if (req.getEstimatedBudget() == null)
            throw new RuntimeException("Budget is required (enter 0 if no budget)");

        Event event = applyRequest(new Event(), req);
        event.setOrganizer(organizer);
        event.setStatus(PENDING_FACULTY);
        return eventRepo.save(event);
    }

    // ── UPDATE ────────────────────────────────────────────────────────────────
    public Event updateEvent(Long id, EventRequest req) {
        Event event = getById(id);
        String s = event.getStatus();
        applyRequest(event, req);
        // On resubmit after rejection → back to PENDING_FACULTY
        if (FACULTY_REJECTED.equals(s) || SDW_REJECTED.equals(s) || HOD_REJECTED.equals(s)) {
            event.setStatus(PENDING_FACULTY);
            event.setFacultyComment(null);
            event.setSdwComment(null);
            event.setHodComment(null);
        }
        return eventRepo.save(event);
    }

    public void deleteEvent(Long id) { eventRepo.delete(getById(id)); }

    // ── SUBMIT BUDGET ─────────────────────────────────────────────────────────
    public Event submitBudget(Long id, EventRequest req) {
        Event event = getById(id);
        if (!FACULTY_APPROVED.equals(event.getStatus()))
            throw new RuntimeException("Budget can only be submitted after Faculty Advisor approves.");
        event.setEstimatedBudget(req.getEstimatedBudget() != null ? req.getEstimatedBudget() : 0.0);
        event.setVenueExpense(req.getVenueExpense());
        event.setFoodExpense(req.getFoodExpense());
        event.setDecorExpense(req.getDecorExpense());
        event.setPrintingExpense(req.getPrintingExpense());
        event.setOtherExpense(req.getOtherExpense());
        event.setBudgetNotes(req.getBudgetNotes());
        // Central events skip dept SDW → go directly to PENDING_HOD via SDW Dean
        // Regular events go to PENDING_SDW
        event.setStatus(PENDING_SDW);
        return eventRepo.save(event);
    }

    // ── FACULTY REVIEW ────────────────────────────────────────────────────────
    public Event facultyReview(Long id, ApprovalRequest req) {
        Event event = getById(id);
        if (!PENDING_FACULTY.equals(event.getStatus()))
            throw new RuntimeException("Event is not awaiting Faculty review.");
        event.setFacultyComment(req.getComment());
        event.setStatus("APPROVE".equalsIgnoreCase(req.getAction())
                ? FACULTY_APPROVED : FACULTY_REJECTED);
        return eventRepo.save(event);
    }

    // ── SDW REVIEW ────────────────────────────────────────────────────────────
    public Event sdwReview(Long id, ApprovalRequest req) {
        Event event = getById(id);
        if (!PENDING_SDW.equals(event.getStatus()))
            throw new RuntimeException("Event is not awaiting SDW review.");
        event.setSdwComment(req.getComment());
        event.setStatus("APPROVE".equalsIgnoreCase(req.getAction())
                ? SDW_APPROVED : SDW_REJECTED);
        return eventRepo.save(event);
    }

    // ── SDW → HoD forward ────────────────────────────────────────────────────
    public Event forwardToHod(Long id) {
        Event event = getById(id);
        if (!SDW_APPROVED.equals(event.getStatus()))
            throw new RuntimeException("Event must be SDW-approved before forwarding to HoD.");
        event.setStatus(PENDING_HOD);
        return eventRepo.save(event);
    }

    // ── Faculty → SDW Dean (central events bypass dept SDW) ──────────────────
    public Event forwardToDean(Long id) {
        Event event = getById(id);
        if (!FACULTY_APPROVED.equals(event.getStatus()))
            throw new RuntimeException("Event must be Faculty-approved first.");
        event.setIsCentralEvent("true");
        event.setStatus(PENDING_SDW);
        return eventRepo.save(event);
    }

    // ── HOD REVIEW ────────────────────────────────────────────────────────────
    public Event hodReview(Long id, ApprovalRequest req) {
        Event event = getById(id);
        if (!PENDING_HOD.equals(event.getStatus()))
            throw new RuntimeException("Event is not awaiting HoD review.");
        event.setHodComment(req.getComment());
        if ("APPROVE".equalsIgnoreCase(req.getAction())) {
            // If organizer set a goLiveDate, honour it; otherwise go live now
            LocalDateTime goLive = event.getGoLiveDate();
            if (goLive != null && goLive.isAfter(LocalDateTime.now())) {
                // Keep as PENDING status but with goLiveDate set — 
                // a scheduled job or frontend check will flip to APPROVED
                // For simplicity: immediately mark APPROVED and let frontend handle display timing
            }
            event.setStatus(APPROVED);
        } else {
            event.setStatus(HOD_REJECTED);
        }
        return eventRepo.save(event);
    }

    // ── POST-EVENT REPORT ─────────────────────────────────────────────────────
    public Event submitPostEventReport(Long id, PostEventRequest req) {
        Event event = getById(id);
        event.setEventReport(req.getEventReport());
        event.setActualExpenditure(req.getActualExpenditure());
        event.setReimbursementDetails(req.getReimbursementDetails());
        if (req.getReportFileData() != null) event.setReportFileData(req.getReportFileData());
        if (req.getReportFileName() != null) event.setReportFileName(req.getReportFileName());
        return eventRepo.save(event);
    }

    // ── SET GO-LIVE DATE (organizer schedules after HoD approval) ─────────────
    public Event setGoLiveDate(Long id, LocalDateTime goLiveDate) {
        Event event = getById(id);
        event.setGoLiveDate(goLiveDate);
        return eventRepo.save(event);
    }

    // ── ANALYTICS ─────────────────────────────────────────────────────────────
    public Map<String, Object> getAnalytics() {
        Map<String, Object> data = new HashMap<>();
        Map<String, Long> byStatus = new HashMap<>();
        for (Object[] row : eventRepo.countByStatus())
            byStatus.put(String.valueOf(row[0]), (Long) row[1]);
        data.put("byStatus", byStatus);
        Map<String, Long> byDept = new HashMap<>();
        for (Object[] row : eventRepo.countByDepartment())
            byDept.put(String.valueOf(row[0]), (Long) row[1]);
        data.put("byDepartment", byDept);
        Map<String, Long> byCat = new HashMap<>();
        for (Object[] row : eventRepo.countByCategory())
            byCat.put(String.valueOf(row[0]), (Long) row[1]);
        data.put("byCategory", byCat);
        data.put("total",    eventRepo.count());
        data.put("approved", eventRepo.findByStatus(APPROVED).size());
        return data;
    }

    // ── QUERIES ───────────────────────────────────────────────────────────────
    public Event getById(Long id) {
        return eventRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found: " + id));
    }
    public List<Event> getAllEvents()       { return eventRepo.findAllByOrderByCreatedAtDesc(); }
    public List<Event> getApprovedEvents() { return eventRepo.findByStatus(APPROVED); }
    public List<Event> getPendingFaculty() { return eventRepo.findByStatus(PENDING_FACULTY); }
    public List<Event> getPendingSdw()     { return eventRepo.findByStatus(PENDING_SDW); }
    public List<Event> getPendingHod()     { return eventRepo.findByStatus(PENDING_HOD); }
    public List<Event> getByOrganizer(Long id) { return eventRepo.findByOrganizerIdOrderByCreatedAtDesc(id); }

    // ── HELPER ────────────────────────────────────────────────────────────────
    private Event applyRequest(Event e, EventRequest req) {
        e.setTitle(req.getTitle());
        e.setDescription(req.getDescription());
        e.setLocation(req.getLocation());
        e.setDepartment(req.getDepartment());
        e.setCategory(req.getCategory());
        e.setClubName(req.getClubName());
        e.setClubDepartment(req.getClubDepartment());
        e.setClubWebsite(req.getClubWebsite());
        e.setIsCentralEvent(req.getIsCentralEvent());
        e.setTheme(req.getTheme());
        e.setEventType(req.getEventType());
        e.setSpeakerName(req.getSpeakerName());
        e.setSpeakerDetails(req.getSpeakerDetails());
        e.setCoordinatorName(req.getCoordinatorName());
        e.setCoordinatorContact(req.getCoordinatorContact());
        e.setCoordinatorsJson(req.getCoordinatorsJson());
        e.setStartDate(req.getStartDate());
        e.setEndDate(req.getEndDate());
        e.setEventDate(req.getStartDate());
        e.setRegistrationDeadline(req.getRegistrationDeadline());
        e.setGoLiveDate(req.getGoLiveDate());
        e.setMaxParticipants(req.getMaxParticipants());
        e.setEntryFee(req.getEntryFee());
        e.setPrizePool(req.getPrizePool());
        e.setGoodies(req.getGoodies());
        e.setEstimatedBudget(req.getEstimatedBudget() != null ? req.getEstimatedBudget() : 0.0);
        if (req.getVenueExpense()    != null) e.setVenueExpense(req.getVenueExpense());
        if (req.getFoodExpense()     != null) e.setFoodExpense(req.getFoodExpense());
        if (req.getDecorExpense()    != null) e.setDecorExpense(req.getDecorExpense());
        if (req.getPrintingExpense() != null) e.setPrintingExpense(req.getPrintingExpense());
        if (req.getOtherExpense()    != null) e.setOtherExpense(req.getOtherExpense());
        if (req.getBudgetNotes()     != null) e.setBudgetNotes(req.getBudgetNotes());
        return e;
    }
}