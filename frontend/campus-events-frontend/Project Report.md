# Campus Event Management System
## Complete Project Report & Viva Preparation Guide

---

## 1. PROJECT OVERVIEW

### What is this project?

This is a **full-stack web application** that manages the entire lifecycle of college events — from an organizer first proposing an event, all the way to students attending it and faculty downloading attendance reports.

Think of it like this: instead of emails going back and forth between students, organizers, and faculty to organize an event, this system gives every person their own dashboard with exactly the tools they need.

### The Problem It Solves

Before this system, organizing a college event involved:
- Organizers sending paper proposals to faculty
- Faculty manually reviewing and sending feedback via email
- No central place for students to find events
- Attendance marked on paper, manually converted to reports
- Budget approvals happening informally with no documentation

This system digitizes and streamlines the entire process.

---

## 2. TECH STACK EXPLAINED

### Frontend — React
React is a JavaScript library for building user interfaces. Instead of reloading the whole page for every action, React only updates the parts of the page that changed. This is called a **Single Page Application (SPA)**.

**Key libraries used:**
- `React Router` — handles navigation between pages without page reload
- `Axios` — makes HTTP requests to the backend API
- `Tailwind CSS` — utility-first CSS framework for styling
- `Lucide React` — icon library

### Backend — Spring Boot (Java)
Spring Boot is a Java framework that makes it easy to build REST APIs. It handles incoming HTTP requests, runs business logic, and talks to the database.

**Key components:**
- `Spring Web` — creates REST endpoints (@RestController, @GetMapping, etc.)
- `Spring Data JPA` — maps Java objects to database tables (no manual SQL needed)
- `Spring Security` — handles password hashing (BCrypt)
- `Hibernate` — ORM that translates Java models to SQL queries

### Database — PostgreSQL (hosted on Supabase)
PostgreSQL is a relational database. Supabase is a cloud service that hosts it and provides a connection URL. We connect using the **Transaction Pooler** on port 6543 which handles multiple simultaneous connections efficiently.

---

## 3. ARCHITECTURE

```
Browser (React)
    │
    │  HTTP Requests (Axios)
    ▼
Spring Boot (Port 8081)
    │  Controllers → Services → Repositories
    ▼
PostgreSQL (Supabase)
    Tables: users, events, registrations, attendance
```

**Data flow example — Student registers for event:**
1. Student clicks "Register" button in React
2. Axios sends `POST /registrations/register?studentId=5&eventId=12`
3. Spring Boot `RegistrationController` receives the request
4. It checks: duplicate? deadline passed? event full?
5. If all checks pass, `RegistrationRepository.save()` writes to DB
6. Returns the saved Registration object as JSON
7. React updates the button to show "✓ Registered"

---

## 4. DATABASE DESIGN

### Tables and relationships:

**users**
```
id | name | email | password (hashed) | role | department | prn | year | division
```
Role can be: STUDENT, ORGANIZER, FACULTY_ADVISOR, SDW_COORDINATOR, HOD

**events**
```
id | title | description | location | department | category | club_name | 
start_date | end_date | registration_deadline | max_participants |
status | organizer_id (FK→users) |
entry_fee | prize_pool | goodies |
faculty_comment | sdw_comment | hod_comment |
estimated_budget | venue_expense | food_expense | decor_expense | printing_expense | other_expense |
event_report | actual_expenditure | reimbursement_details |
coordinators_json | coordinator_name | coordinator_contact |
created_at
```

**registrations**
```
id | student_id (FK→users) | event_id (FK→events) | status | registered_at
```
Has a UNIQUE constraint on (student_id, event_id) — prevents duplicate registrations at the DB level.

**attendance**
```
id | registration_id (FK→registrations) | present | marked_at | marked_by (FK→users)
```

### Relationships:
- One User can create many Events (one-to-many)
- One Event can have many Registrations (one-to-many)  
- One Registration has one Attendance record (one-to-one)
- One User (student) can have many Registrations (one-to-many)

---

## 5. THE APPROVAL WORKFLOW

This is the most important feature of the system.

```
Organizer creates event
        ↓
  PENDING_FACULTY ← Faculty Advisor reviews here
        ↓ (Approve)
  FACULTY_APPROVED
        ↓ (Organizer submits budget)
    PENDING_SDW ← SDW Coordinator reviews event + budget
        ↓ (Approve)
    SDW_APPROVED
        ↓ (SDW forwards to HoD)
    PENDING_HOD ← HoD gives final approval
        ↓ (Approve)
      APPROVED ← Now visible to students!
```

At any stage, the reviewer can REJECT — the organizer sees the comment, edits, and resubmits (goes back to PENDING_FACULTY).

**Why this design?** Real college event approvals happen in exactly this sequence: faculty advisor first, then student development wing, then head of department.

---

## 6. KEY TECHNICAL DECISIONS EXPLAINED

### Why store coordinators as JSON string?
Multiple coordinators is a "one event has many coordinators" relationship. The proper relational way would be a separate `coordinators` table. However, since coordinator data is always accessed with the event (never independently), storing it as a JSON string in the events table is simpler and faster — no extra JOIN query needed. This is a deliberate tradeoff.

### Why use String for status instead of Enum in some places?
The database was created with a PostgreSQL USER-DEFINED type (similar to enum) for the status column. Hibernate's `@Enumerated(EnumType.STRING)` works when the Java enum values exactly match the DB type values. We use `EventStatus` enum in Java and `@Enumerated(EnumType.STRING)` — Hibernate converts the enum name to a string automatically.

### Why no JWT authentication?
For a college project with a controlled set of users, session-based role checking on the frontend is acceptable. The user's role is stored in `localStorage` after login and checked on every protected route. A production system would add Spring Security JWT tokens.

### Why BCrypt for passwords?
BCrypt is an adaptive hashing algorithm specifically designed for passwords. It's slow by design (making brute-force attacks expensive) and includes a salt automatically (preventing rainbow table attacks). Spring Security's `BCryptPasswordEncoder` handles this.

### Why Supabase Transaction Pooler on port 6543?
Hibernate opens many JDBC connections for DDL operations at startup. The direct Supabase connection on port 5432 has limits. The transaction pooler manages a pool of connections, so many app threads can share fewer actual DB connections. The `prepareThreshold=0` parameter disables prepared statements which are not supported in pooler mode.

---

## 7. SPRING BOOT CONCEPTS USED

### @RestController
Marks a class as a REST API controller. Every method returns data (JSON) instead of a view template.

### @RequestMapping, @GetMapping, @PostMapping
Map HTTP methods and URLs to Java methods.
```java
@GetMapping("/events/approved")  →  GET http://localhost:8081/events/approved
@PostMapping("/events")          →  POST http://localhost:8081/events
```

### @Entity and @Table
Tell Hibernate that this Java class maps to a database table.

### @ManyToOne, @OneToMany, @OneToOne
Define relationships between entities. Hibernate generates the correct SQL JOINs.

### @JoinColumn
Specifies which column is the foreign key.

### @JsonIgnoreProperties
Prevents infinite loops in JSON serialization. For example, Registration has an Event, and Event has an Organizer (User). Without this annotation, Jackson would serialize Event → Organizer → all their Events → each Event's Organizer → infinite loop.

### @Enumerated(EnumType.STRING)
Stores the enum as its string name ("APPROVED") in the DB instead of its ordinal number (0, 1, 2...). String is much safer — if you reorder your enum, ordinal numbers change and break existing data.

### Spring Data JPA Repositories
By extending `JpaRepository<Event, Long>`, you get `save()`, `findById()`, `findAll()`, `delete()` etc. for free. Custom queries are created just by naming methods:
```java
List<Event> findByStatus(EventStatus status);
// Hibernate generates: SELECT * FROM events WHERE status = ?
```

### @CrossOrigin
Allows the React frontend (port 5173) to call the Spring Boot backend (port 8081). Browsers block cross-origin requests by default — this annotation adds the necessary CORS headers.

---

## 8. REACT CONCEPTS USED

### useState
Stores component-level data that, when changed, re-renders the component.
```javascript
const [events, setEvents] = useState([]);
// events = current value, setEvents = function to update it
```

### useEffect
Runs code after the component renders. Used for API calls.
```javascript
useEffect(() => {
  api.get("/events/approved").then(r => setEvents(r.data));
}, []); // Empty [] = run once when component mounts
```

### React Router
Handles navigation. `<Routes>` and `<Route>` define which component renders at which URL. `useNavigate()` lets you programmatically change pages.

### Props
Data passed from parent to child component. `onLogout` is passed from `App.jsx` down to every dashboard so they can call the same logout function.

### Conditional rendering
```javascript
{loading ? <Spinner/> : <EventList events={events}/>}
// Shows Spinner while loading, EventList when done
```

---

## 9. THREE-PERSON CONTRIBUTION SPLIT

---

### PERSON 1 — Backend Developer (Spring Boot + Database)

**What they built:**
- All Java models (`User.java`, `Event.java`, `Registration.java`, `Attendance.java`)
- All repositories (Spring Data JPA)
- `AuthService.java` — signup with BCrypt password hashing, login validation
- `EventService.java` — complete approval workflow logic (all 3 stages)
- `AttendanceService.java` — mark and retrieve attendance
- `RegistrationService.java` — register with duplicate, deadline, capacity checks
- All controllers with proper HTTP status codes
- `SecurityConfig.java` and `WebConfig.java` — CORS and password encoder
- Database migration SQL — all table alterations
- `application.properties` — Supabase connection configuration

**Their contribution in one line:** "I built the entire server-side logic — all APIs, business rules, and database integration."

**Technical depth they should know:**
- How Spring Data JPA generates SQL from method names
- Why BCrypt is used for passwords
- What `@JsonIgnoreProperties` solves
- How the event status state machine works
- Why port 6543 with prepareThreshold=0 is needed for Supabase

---

### PERSON 2 — Frontend Developer (React UI/UX)

**What they built:**
- `App.jsx` — role-based routing with Guard component
- `Sidebar.jsx` — dynamic menus per role with color theming
- `Login.jsx` and `Signup.jsx` — role-aware registration forms
- All student pages: `StudentDashboard`, `StudentEvents`, `StudentRegistrations`
- `EventDetailDrawer.jsx` — slide-in event details panel
- `WorkflowBadge.jsx` — visual approval pipeline component
- `index.css` — global Tailwind CSS utilities (glass cards, badges, buttons)
- `constants.js` — all dropdown data
- Responsive grid layouts, search/filter functionality
- Deadline guard, capacity check, duplicate registration prevention on frontend

**Their contribution in one line:** "I built the entire user interface — all React pages, reusable components, and user experience design."

**Technical depth they should know:**
- How React Router protects routes (the Guard component)
- Why `useEffect` with `[]` runs only once
- How `localStorage` stores the user session
- What `Array.isArray()` guard does and why it's needed
- How Tailwind CSS utility classes work

---

### PERSON 3 — Full-Stack Developer (Organizer + Faculty + SDW + HoD flows)

**What they built:**
- All organizer pages: `OrganizerDashboard`, `CreateEvent` (multi-day, multiple coordinators), `SubmitBudget`, `PostEventReport`, `OrganizerParticipants` (attendance marking)
- All faculty pages: `FacultyDashboard`, `FacultyApprovals`, `FacultyReports` (CSV export)
- `SDWDashboard` and `SDWApprovals` — budget review, forward to HoD
- `HoDDashboard` and `HoDApprovals` — final approval
- `ApprovalModal.jsx` — approve/reject modal with comment validation
- Connecting all API calls between frontend and backend
- Testing end-to-end workflow from event creation to student visibility
- CSV export functionality for attendance reports

**Their contribution in one line:** "I built all the approval workflow pages and connected the frontend to the backend APIs end-to-end."

**Technical depth they should know:**
- How the 3-stage approval workflow flows through the system
- How budget is submitted separately only after faculty approval
- Why nested `<button>` inside `<button>` causes errors (HTML spec violation)
- How CSV export works (Blob, createObjectURL)
- How attendance marking works (multiple API calls in parallel with Promise.all)

---

## 10. VIVA QUESTION BANK WITH ANSWERS

---

### SPRING BOOT QUESTIONS

**Q: What is the difference between @Component, @Service, and @Repository?**
A: All three are specializations of @Component — Spring detects them all during component scanning and creates beans. The difference is semantic and for readability: @Service marks business logic classes, @Repository marks data access classes (and adds exception translation), @Component is the generic version for anything else.

**Q: How does Spring Data JPA work? Do you write SQL?**
A: Spring Data JPA lets us define repository interfaces that extend JpaRepository. We only write method signatures — Spring analyzes the method name and generates the SQL automatically. For example, `findByStatus(EventStatus status)` becomes `SELECT * FROM events WHERE status = ?`. For complex queries we can use @Query with JPQL.

**Q: What is the difference between @ManyToOne and @OneToMany?**
A: From the perspective of the entity owning the annotation. In our system, many Registrations belong to one Event — so in the Registration class we put `@ManyToOne` on the event field. The "many" side holds the foreign key column.

**Q: What is Hibernate and how does it relate to JPA?**
A: JPA (Java Persistence API) is a specification — a set of rules/interfaces for ORM in Java. Hibernate is the most popular *implementation* of that specification. Spring Data JPA sits on top of JPA, and Hibernate is the engine underneath doing the actual work.

**Q: Why did you use BCrypt for passwords?**
A: BCrypt is specifically designed for password hashing. It's intentionally slow (configurable rounds), includes a random salt automatically, and is resistant to GPU-accelerated brute force attacks. MD5 or SHA256 are fast (good for file checksums) but bad for passwords because they can be brute-forced quickly.

**Q: What is CORS and why did you add WebConfig?**
A: CORS (Cross-Origin Resource Sharing) is a browser security feature that blocks requests from one origin (localhost:5173) to another (localhost:8081). Since our React and Spring Boot run on different ports, the browser blocks the request. WebConfig adds response headers like `Access-Control-Allow-Origin` that tell the browser to permit the request.

**Q: Explain the `ddl-auto=update` setting.**
A: This tells Hibernate to automatically update the database schema when the application starts — it adds new columns/tables based on your entity classes, but never drops existing ones. In production you'd use `validate` (just check schema matches) or `none` (manage schema manually).

**Q: What is the n+1 query problem and how does FETCH EAGER help?**
A: If you load 10 events lazily, then access each event's organizer, Hibernate makes 1 query for events + 10 more for organizers = 11 queries. `FetchType.EAGER` joins the organizer in the initial query so it's 1 query total. However, EAGER can cause performance issues for large datasets — you'd use `@EntityGraph` or JOIN FETCH in production.

---

### REACT QUESTIONS

**Q: What is the Virtual DOM?**
A: React keeps a lightweight copy of the real DOM in memory (the Virtual DOM). When state changes, React updates the Virtual DOM first, compares it to the previous version (diffing), and then only applies the minimal real DOM changes needed. This is much faster than re-rendering the entire page.

**Q: Why do we use useState instead of regular variables?**
A: Regular JavaScript variables don't trigger re-renders. When you call `setEvents([...newData])`, React knows the state changed and re-renders the component with the new data. A regular variable change would update the value but the screen would not update.

**Q: What is the purpose of the dependency array in useEffect?**
A: It controls when the effect runs. Empty array `[]` = run once on mount. With values `[userId]` = re-run whenever userId changes. No array = run after every render (usually a bug).

**Q: How does routing work? What happens when a user navigates to /faculty/approvals?**
A: React Router matches the URL `/faculty/approvals` to the `<Route path="/faculty/approvals">` definition in App.jsx. Before rendering the component, it passes through the `Guard` component which checks if the user's role matches "FACULTY_ADVISOR". If not, it redirects to /login.

**Q: Why is localStorage used for user session?**
A: After login, the server returns the user's id, name, role, etc. We store this in `localStorage` (browser storage that persists across page refreshes). When the app loads, we check localStorage to see if a user is already logged in. This is a simple session mechanism — in production you'd use HttpOnly cookies with JWT tokens.

**Q: What is prop drilling and how does this project handle it?**
A: Prop drilling is when you pass props through many levels of components that don't use them, just to reach a deeply nested component. In this project, `onLogout` is passed from App to each dashboard page. It's only one level deep, so it's acceptable here. For deeper trees, React Context or a state management library would be used.

---

### GENERAL PROJECT QUESTIONS

**Q: How does a student know if registration deadline has passed?**
A: Both frontend and backend check. The frontend compares `new Date()` to `event.registrationDeadline` and shows a "Registration Closed" badge instead of the Register button. The backend `RegistrationController` also checks and returns HTTP 410 (Gone) if the deadline has passed — so even if someone bypasses the UI, the API rejects the request.

**Q: What prevents a student from registering twice?**
A: Three layers of protection: (1) The `registrations` table has a UNIQUE constraint on (student_id, event_id) at the database level. (2) `RegistrationRepository.existsByStudentIdAndEventId()` checks before inserting. (3) The frontend tracks registered event IDs in state and hides the Register button for already-registered events.

**Q: How does the budget become visible to SDW but not to students?**
A: The `EventDetailDrawer` component accepts a `showBudget` prop. When rendered for students, `showBudget={false}` hides the budget section. When rendered for Faculty/SDW/HoD, `showBudget={true}` shows it. The API returns budget data to everyone, but the frontend controls what to display.

**Q: What happens if the HoD rejects an event that was already approved by Faculty and SDW?**
A: The status becomes `HOD_REJECTED`. The organizer sees this on their dashboard with the HoD's comment. They edit the event and resubmit — the `updateEvent` service method automatically resets the status to `PENDING_FACULTY`, so the entire approval chain starts again from the beginning.

**Q: How does CSV export work?**
A: We create a string of comma-separated values in JavaScript, wrap it in a `Blob` (binary large object) with MIME type "text/csv", create a temporary URL using `URL.createObjectURL()`, programmatically click a hidden link element with that URL as `href`, then revoke the URL to free memory. The browser treats this as a file download.

---

## 11. SUMMARY — ONE-LINE DESCRIPTIONS FOR VIVA

| Component | What it does |
|-----------|-------------|
| `App.jsx` | Defines all routes and prevents unauthorized access via Guard component |
| `AuthController` | Handles signup and login, returns user object with role |
| `AuthService` | Hashes passwords with BCrypt, validates login credentials |
| `EventController` | 15+ endpoints for full event CRUD + approval workflow |
| `EventService` | Business logic: status transitions, budget submission, approval rules |
| `RegistrationController` | Register student for event with duplicate/deadline/capacity checks |
| `AttendanceController` | Mark attendance by registration ID, fetch by event ID |
| `WorkflowBadge` | Visual component showing 6-step approval pipeline with color states |
| `ApprovalModal` | Reusable modal for approve/reject with mandatory comment on rejection |
| `EventDetailDrawer` | Slide-in panel showing full event info, hides budget from students |
| `StudentDashboard` | Shows approved events with registration state, deadline guard |
| `FacultyApprovals` | Lists all events filtered by status tab, approve/reject with comment |
| `SDWApprovals` | Shows event + budget for review, forward-to-HoD button |
| `HoDApprovals` | Final approval — sets status to APPROVED making event live to students |
| `OrganizerParticipants` | Mark attendance per student with toggle, save all at once |
| `FacultyReports` | Attendance table per event with CSV download including PRN and division |

---

*This report covers the complete technical architecture, all major design decisions with justifications, and preparation for faculty viva questions in both Spring Boot and React contexts.*