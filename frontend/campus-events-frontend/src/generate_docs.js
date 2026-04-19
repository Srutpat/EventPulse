const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  HeadingLevel, AlignmentType, BorderStyle, WidthType, ShadingType,
  LevelFormat, PageBreak, Footer, Header,
  TableOfContents
} = require('docx');
const fs = require('fs');

// ── helpers ───────────────────────────────────────────────────────────────
const border = { style: BorderStyle.SINGLE, size: 1, color: "D1D5DB" };
const borders = { top: border, bottom: border, left: border, right: border };
const INDENT = { left: 720, hanging: 360 };

const h1 = (text, color="2D3748") => new Paragraph({
  heading: HeadingLevel.HEADING_1,
  spacing: { before: 400, after: 160 },
  children: [new TextRun({ text, bold: true, size: 36, font: "Calibri", color })]
});
const h2 = (text, color="374151") => new Paragraph({
  heading: HeadingLevel.HEADING_2,
  spacing: { before: 300, after: 120 },
  children: [new TextRun({ text, bold: true, size: 28, font: "Calibri", color })]
});
const h3 = (text) => new Paragraph({
  heading: HeadingLevel.HEADING_3,
  spacing: { before: 200, after: 80 },
  children: [new TextRun({ text, bold: true, size: 24, font: "Calibri", color: "4B5563" })]
});
const p = (text, opts={}) => new Paragraph({
  spacing: { before: 60, after: 60 },
  children: [new TextRun({ text, size: 22, font: "Calibri", ...opts })]
});
const code = (text) => new Paragraph({
  spacing: { before: 40, after: 40 },
  indent: { left: 720 },
  shading: { fill: "F3F4F6", type: ShadingType.CLEAR },
  children: [new TextRun({ text, size: 18, font: "Courier New", color: "1F2937" })]
});
const bullet = (text, bold=false) => new Paragraph({
  numbering: { reference: "bullets", level: 0 },
  spacing: { before: 40, after: 40 },
  children: [new TextRun({ text, size: 22, font: "Calibri", bold })]
});
const divider = () => new Paragraph({
  spacing: { before: 200, after: 200 },
  border: { bottom: { style: BorderStyle.SINGLE, size: 3, color: "E5E7EB" } },
  children: [new TextRun("")]
});
const pageBreak = () => new Paragraph({ children: [new PageBreak()] });

function infoTable(rows) {
  return new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [2800, 6560],
    rows: rows.map(([label, value]) => new TableRow({
      children: [
        new TableCell({
          borders, width: { size: 2800, type: WidthType.DXA },
          shading: { fill: "F9FAFB", type: ShadingType.CLEAR },
          margins: { top: 80, bottom: 80, left: 120, right: 120 },
          children: [new Paragraph({ children: [new TextRun({ text: label, bold: true, size: 20, font: "Calibri" })] })]
        }),
        new TableCell({
          borders, width: { size: 6560, type: WidthType.DXA },
          margins: { top: 80, bottom: 80, left: 120, right: 120 },
          children: [new Paragraph({ children: [new TextRun({ text: value, size: 20, font: "Calibri" })] })]
        })
      ]
    }))
  });
}

function fileTable(rows) {
  return new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [3000, 6360],
    rows: [
      new TableRow({
        tableHeader: true,
        children: ["File / Folder", "Purpose"].map((h, ci) => new TableCell({
          borders,
          width: { size: ci===0 ? 3000 : 6360, type: WidthType.DXA },
          shading: { fill: "4F46E5", type: ShadingType.CLEAR },
          margins: { top: 80, bottom: 80, left: 120, right: 120 },
          children: [new Paragraph({ children: [new TextRun({ text: h, bold: true, size: 20, font: "Calibri", color: "FFFFFF" })] })]
        }))
      }),
      ...rows.map(([file, desc], i) => new TableRow({
        children: [
          new TableCell({
            borders,
            width: { size: 3000, type: WidthType.DXA },
            shading: { fill: i%2===0 ? "FFFFFF" : "F9FAFB", type: ShadingType.CLEAR },
            margins: { top: 80, bottom: 80, left: 120, right: 120 },
            children: [new Paragraph({ children: [new TextRun({ text: file, size: 18, font: "Courier New", color: "4F46E5" })] })]
          }),
          new TableCell({
            borders,
            width: { size: 6360, type: WidthType.DXA },
            shading: { fill: i%2===0 ? "FFFFFF" : "F9FAFB", type: ShadingType.CLEAR },
            margins: { top: 80, bottom: 80, left: 120, right: 120 },
            children: [new Paragraph({ children: [new TextRun({ text: desc, size: 20, font: "Calibri" })] })]
          })
        ]
      }))
    ]
  });
}

// ── DOCUMENT ──────────────────────────────────────────────────────────────
const doc = new Document({
  numbering: {
    config: [
      { reference: "bullets", levels: [{ level: 0, format: LevelFormat.BULLET, text: "\u2022",
          alignment: AlignmentType.LEFT, style: { paragraph: { indent: INDENT } } }] },
      { reference: "numbers", levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.",
          alignment: AlignmentType.LEFT, style: { paragraph: { indent: INDENT } } }] },
    ]
  },
  styles: {
    default: { document: { run: { font: "Calibri", size: 22 } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 36, bold: true, font: "Calibri", color: "2D3748" },
        paragraph: { spacing: { before: 400, after: 160 }, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 28, bold: true, font: "Calibri", color: "374151" },
        paragraph: { spacing: { before: 300, after: 120 }, outlineLevel: 1 } },
      { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 24, bold: true, font: "Calibri", color: "4B5563" },
        paragraph: { spacing: { before: 200, after: 80 }, outlineLevel: 2 } },
    ]
  },
  sections: [{
    properties: {
      page: { size: { width: 12240, height: 15840 }, margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } }
    },
    footers: {
      default: new Footer({
        children: [new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({ text: "EventPulse — Project Documentation  |  Page ", size: 18, font: "Calibri", color: "9CA3AF" }),
            
          ]
        })]
      })
    },
    children: [

      // ═══ COVER PAGE ═══════════════════════════════════════════════════════
      new Paragraph({
        alignment: AlignmentType.CENTER, spacing: { before: 1440, after: 360 },
        children: [new TextRun({ text: "EventPulse", bold: true, size: 72, font: "Calibri", color: "4F46E5" })]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER, spacing: { before: 0, after: 200 },
        children: [new TextRun({ text: "Campus Event Management System", size: 36, font: "Calibri", color: "6B7280" })]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER, spacing: { before: 0, after: 800 },
        children: [new TextRun({ text: "Complete Project Documentation", size: 28, font: "Calibri", color: "9CA3AF", italics: true })]
      }),
      infoTable([
        ["Project Name",   "EventPulse — Campus Event Management System"],
        ["Version",        "1.0.0  (Production-Ready)"],
        ["Tech Stack",     "React 18 + Spring Boot 4 + PostgreSQL (Supabase)"],
        ["Deployment",     "Vercel (Frontend)  +  Railway (Backend)"],
        ["Architecture",   "Multi-tier  |  REST API  |  5-Role RBAC + JWT Auth"],
        ["Document Date",  new Date().toLocaleDateString('en-IN', {day:'numeric',month:'long',year:'numeric'})],
      ]),
      pageBreak(),

      // ═══ SECTION 1: PROJECT OVERVIEW ══════════════════════════════════════
      h1("1. Project Overview", "4F46E5"),
      p("EventPulse is a full-stack web application that digitises the entire college event lifecycle — from proposal submission through multi-stage institutional approval to live registration by students. It replaces manual paperwork and WhatsApp chains with a structured, role-based, audited workflow."),
      p(""),
      h2("1.1 System Purpose"),
      bullet("Organizers create event proposals with budget details"),
      bullet("Faculty Advisors review and approve events for their clubs"),
      bullet("SDW Coordinators perform budget review and forward to HoD"),
      bullet("Head of Department gives final approval — making the event live"),
      bullet("Students browse live events and register in one click"),
      p(""),
      h2("1.2 Key Technical Highlights"),
      bullet("JWT-based stateless authentication with BCrypt password hashing"),
      bullet("5-stage event approval state machine enforced server-side"),
      bullet("Attribute-Based Access Control — Faculty see only their clubs' events"),
      bullet("Real-time Analytics Dashboard with Recharts visualisations (USP)"),
      bullet("Attendance marking locked to event's active time window"),
      bullet("PostgreSQL with @JsonIgnoreProperties to prevent circular serialisation"),
      divider(),

      // ═══ SECTION 2: ARCHITECTURE ══════════════════════════════════════════
      h1("2. System Architecture"),
      h2("2.1 Three-Tier Architecture"),
      p("The system follows a strict three-tier architecture separating presentation, business logic, and data concerns."),
      p(""),
      code("Browser (React + Vite)"),
      code("      |  HTTPS / REST API + JWT"),
      code("      v"),
      code("Spring Boot API (Railway :8081)"),
      code("      |  JDBC over SSL (port 6543)"),
      code("      v"),
      code("PostgreSQL (Supabase Cloud)"),
      p(""),
      h2("2.2 Approval Workflow (State Machine)"),
      p("The event lifecycle is a deterministic state machine with 9 valid status values. Every transition is validated server-side — API rejects invalid state changes even if called directly."),
      p(""),
      code("PENDING_FACULTY  →  FACULTY_APPROVED  →  PENDING_SDW"),
      code("                 ↘  FACULTY_REJECTED (→ Organizer edits → PENDING_FACULTY)"),
      code(""),
      code("PENDING_SDW  →  SDW_APPROVED  →  PENDING_HOD"),
      code("             ↘  SDW_REJECTED  (→ Organizer edits → PENDING_FACULTY)"),
      code(""),
      code("PENDING_HOD  →  APPROVED  (event goes live to students)"),
      code("             ↘  HOD_REJECTED (→ Organizer edits → PENDING_FACULTY)"),
      code(""),
      code("Central events (NSS): Faculty → forward-dean → PENDING_SDW (Dean only)"),
      p(""),
      h2("2.3 Role-Based Access Control Matrix"),
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [2200, 1200, 1200, 1200, 1200, 1200, 1160],
        rows: [
          new TableRow({ tableHeader: true, children: ["Feature","Student","Organizer","Faculty","SDW","HoD"].map((h,ci)=>
            new TableCell({ borders, width:{size:[2200,1200,1200,1200,1200,1160][ci]||1200,type:WidthType.DXA},
              shading:{fill:"4F46E5",type:ShadingType.CLEAR}, margins:{top:80,bottom:80,left:80,right:80},
              children:[new Paragraph({alignment:AlignmentType.CENTER,children:[new TextRun({text:h,bold:true,size:18,font:"Calibri",color:"FFFFFF"})]})]
            }))
          }),
          ...([
            ["Register for Events","✓","—","—","—","—"],
            ["Browse Live Events","✓","✓","✓","✓","✓"],
            ["Create Events","—","✓","—","—","—"],
            ["Submit Budget","—","✓","—","—","—"],
            ["Faculty Review","—","—","✓","—","—"],
            ["SDW / Budget Review","—","—","—","✓","—"],
            ["Final HoD Approval","—","—","—","—","✓"],
            ["Mark Attendance","—","✓","—","—","—"],
            ["Download Attendance","—","—","✓","✓","—"],
            ["Post-Event Report","—","✓","—","—","—"],
            ["Analytics Dashboard","—","✓","✓","✓","✓"],
          ].map((row,ri)=>new TableRow({children:row.map((cell,ci)=>new TableCell({
            borders, width:{size:[2200,1200,1200,1200,1200,1160][ci]||1200,type:WidthType.DXA},
            shading:{fill:ri%2===0?"FFFFFF":"F9FAFB",type:ShadingType.CLEAR},
            margins:{top:60,bottom:60,left:80,right:80},
            children:[new Paragraph({alignment:ci===0?AlignmentType.LEFT:AlignmentType.CENTER,
              children:[new TextRun({text:cell,size:18,font:"Calibri",
                color:cell==="✓"?"059669":cell==="—"?"9CA3AF":"1F2937"})]})]
          }))})))
        ]
      }),
      divider(),

      // ═══ SECTION 3: DATABASE SCHEMA ═══════════════════════════════════════
      h1("3. Database Schema"),
      h2("3.1 Entity Relationship Overview"),
      p("Four core tables with clearly defined foreign key relationships. All status fields use plain VARCHAR to survive schema evolution without Hibernate enum crashes."),
      p(""),
      h3("users"),
      fileTable([
        ["id (PK)", "Auto-increment bigint primary key"],
        ["email (UNIQUE)", "Login identifier — unique constraint enforced at DB level"],
        ["password", "BCrypt hashed — never returned in API responses (@JsonIgnore)"],
        ["role", "VARCHAR: STUDENT | ORGANIZER | FACULTY_ADVISOR | SDW_COORDINATOR | HOD"],
        ["department", "User's own department (for SDW/HoD scoping; blank = SDW Dean)"],
        ["prn (UNIQUE)", "Student-only: Permanent Registration Number"],
        ["year", "Student-only: FE / SE / TE / BE"],
        ["club_name", "Organizer's primary club"],
        ["club_department", "Organizer: 'central' or specific dept name"],
        ["club_names", "Faculty: comma-separated list of clubs advised (e.g. 'CSI, NSS')"],
        ["subject / specialization", "Faculty / SDW / HoD academic details"],
      ]),
      p(""),
      h3("events"),
      fileTable([
        ["id (PK)", "Auto-increment primary key"],
        ["organizer_id (FK)", "References users.id — the organizer who created this event"],
        ["status (VARCHAR)", "State machine value: PENDING_FACULTY → ... → APPROVED"],
        ["department", "NULL for central events (NSS etc); dept name for regular events"],
        ["is_central_event", "'true' for college-level cells — routes to SDW Dean directly"],
        ["estimated_budget", "REQUIRED (0.0 if no budget). Submitted by organizer at creation."],
        ["faculty/sdw/hod_comment", "Reviewer comments — only visible to staff, hidden from students"],
        ["go_live_date", "Optional: organizer can delay going live after HoD approval"],
        ["registration_deadline", "After this datetime, students cannot register"],
        ["coordinators_json", "JSON array of {name, contact} objects — multiple coordinators"],
      ]),
      p(""),
      h3("registrations"),
      fileTable([
        ["id (PK)", "Auto-increment primary key"],
        ["student_id (FK)", "References users.id"],
        ["event_id (FK)", "References events.id"],
        ["UNIQUE(student_id, event_id)", "Database-level duplicate registration prevention"],
        ["status", "REGISTERED (default)"],
      ]),
      p(""),
      h3("attendance"),
      fileTable([
        ["id (PK)", "Auto-increment primary key"],
        ["registration_id (FK, UNIQUE)", "One attendance record per registration"],
        ["present", "Boolean — marked by organizer during event window only"],
        ["marked_by (FK)", "References users.id — the organizer who marked attendance"],
      ]),
      divider(),

      // ═══ SECTION 4: BACKEND FILE DOCUMENTATION ════════════════════════════
      h1("4. Backend — File-by-File Documentation"),
      p("The backend is a Spring Boot 4 application structured in standard layered architecture: Controller → Service → Repository → Model. All classes follow dependency injection via constructor injection."),
      p(""),

      h2("4.1  model/ — JPA Entities"),
      p("Each class in this package is a JPA entity mapped to a database table via Hibernate. They represent the core data objects of the system."),
      p(""),
      h3("User.java"),
      p("Maps to the users table. Contains all 5 role variants' fields in a single table (flat schema). The @JsonIgnore annotation on the password field is the critical security gate — it guarantees the password hash is never serialised to any API response regardless of which endpoint returns a User object. The role field uses @Enumerated(EnumType.STRING) which stores 'FACULTY_ADVISOR' as a readable string."),
      bullet("Key annotation: @JsonIgnore on password"),
      bullet("club_names field: comma-separated clubs for faculty multi-club advisory"),
      bullet("department: null/blank for SDW Dean enables 'see all' behaviour in filterForSDW"),
      p(""),
      h3("Event.java"),
      p("Maps to the events table. The most complex entity in the system — 40+ fields covering the full event lifecycle. CRITICAL design decision: status is stored as plain String, not the EventStatus enum. This was necessary because old database rows with legacy status values like 'PENDING_APPROVAL' caused Hibernate to throw deserialization exceptions silently, returning empty lists. String status makes it resilient to any database value."),
      bullet("@JsonIgnoreProperties on organizer field breaks circular serialisation (Event→User→Events→...)"),
      bullet("isCentralEvent = 'true' routes the event to SDW Dean instead of dept SDW"),
      bullet("coordinatorsJson stores JSON array for multiple coordinators"),
      p(""),
      h3("Registration.java"),
      p("Junction table between Student (User) and Event. The UNIQUE constraint on (student_id, event_id) is declared at database level, not just application level — this is the last line of defence against duplicate registrations if the frontend check is bypassed."),
      p(""),
      h3("Attendance.java"),
      p("One-to-one with Registration. Presence or absence of an attendance record indicates whether attendance has been marked. The timing restriction (only during event window) is enforced in the frontend; the backend stores whatever is sent."),
      p(""),

      h2("4.2  dto/ — Data Transfer Objects"),
      p("DTOs separate the API contract from the entity model. They receive incoming JSON, validate it, and pass it to the service layer. They are plain Java classes with no JPA annotations."),
      fileTable([
        ["RegisterRequest.java",  "Signup payload — all fields for all 5 roles in one class"],
        ["LoginRequest.java",     "email + password for authentication"],
        ["EventRequest.java",     "Create/update event payload — all 40+ event fields including budget"],
        ["ApprovalRequest.java",  "action (APPROVE/REJECT) + comment for review endpoints"],
        ["PostEventRequest.java", "Post-event: report text, file data (base64), actual expenditure"],
      ]),
      p(""),

      h2("4.3  repository/ — Spring Data JPA"),
      p("Repository interfaces extend JpaRepository<Entity, ID>. Spring auto-generates SQL at startup based on method name conventions. Custom @Query annotations are used for analytics and complex multi-condition queries."),
      fileTable([
        ["UserRepository.java",         "existsByEmail(), existsByPrn(), findByEmail()"],
        ["EventRepository.java",         "findByStatus(String), countByStatus(), countByDepartment(), findAllByOrderByCreatedAtDesc()"],
        ["RegistrationRepository.java",  "existsByStudentIdAndEventId(), countByEventId(), findByStudentId()"],
        ["AttendanceRepository.java",    "findByRegistrationId()"],
      ]),
      p(""),

      h2("4.4  service/ — Business Logic"),
      p("Services contain all business logic. They are @Service annotated Spring beans injected into controllers via constructor injection. No @Autowired field injection is used — constructor injection is more testable and explicit."),
      p(""),
      h3("EventService.java — the core of the system"),
      p("Contains the state machine logic. Every status transition is validated: if facultyReview() is called on an event that is not in PENDING_FACULTY status, it throws RuntimeException which the controller converts to HTTP 400. String constants (PENDING_FACULTY, SDW_APPROVED etc.) are public static final fields so other classes can reference them without string literals."),
      bullet("createEvent(): validates budget is not null, sets status=PENDING_FACULTY"),
      bullet("facultyReview(): checks PENDING_FACULTY, sets FACULTY_APPROVED or FACULTY_REJECTED"),
      bullet("submitBudget(): validates FACULTY_APPROVED, moves to PENDING_SDW"),
      bullet("sdwReview(): validates PENDING_SDW, moves to SDW_APPROVED or SDW_REJECTED"),
      bullet("forwardToHod(): validates SDW_APPROVED, moves to PENDING_HOD"),
      bullet("forwardToDean(): for central events — skips dept SDW, goes to PENDING_SDW (Dean sees it)"),
      bullet("hodReview(): validates PENDING_HOD, moves to APPROVED or HOD_REJECTED"),
      bullet("On any rejection + organizer edit: status resets to PENDING_FACULTY (full chain restart)"),
      p(""),
      h3("AuthService.java"),
      p("Handles signup and login. signup() checks for duplicate email and PRN before creating. login() uses BCryptPasswordEncoder.matches() — never stores or compares plaintext passwords. Returns the User entity on success; the controller adds the JWT token before sending to frontend."),
      p(""),
      h3("AttendanceService.java"),
      p("Upserts attendance records — if a record exists for the registrationId it updates, otherwise creates. This allows organizers to correct attendance marks."),
      p(""),

      h2("4.5  controller/ — REST API Layer"),
      p("Controllers are @RestController beans that handle HTTP requests, delegate to services, and return ResponseEntity. All error handling uses try-catch with RuntimeException — services throw, controllers catch and return appropriate HTTP status codes."),
      fileTable([
        ["AuthController.java",         "POST /auth/signup, POST /auth/login — returns JWT token on login"],
        ["EventController.java",         "20+ endpoints for full event CRUD + all approval workflow actions"],
        ["RegistrationController.java",  "POST /registrations/register — with deadline, capacity, duplicate checks"],
        ["AttendanceController.java",    "POST /attendance/mark — upsert; GET /attendance/event/{id}"],
      ]),
      p(""),

      h2("4.6  config/ — Infrastructure Configuration"),
      fileTable([
        ["SecurityConfig.java",  "Spring Security chain: disables session, adds JwtFilter before auth, permits /auth/** and /events/approved"],
        ["JwtUtil.java",         "Token generation and validation using JJWT library + HMAC-SHA256"],
        ["JwtFilter.java",       "OncePerRequestFilter — extracts Bearer token, validates, sets SecurityContext"],
        ["WebConfig.java",       "CORS mapping — allows localhost:5173, FRONTEND_URL env var, *.vercel.app"],
        ["JacksonConfig.java",   "Global Jackson config — JavaTimeModule for LocalDateTime, WRITE_DATES_AS_TIMESTAMPS=false"],
      ]),
      divider(),

      // ═══ SECTION 5: FRONTEND FILE DOCUMENTATION ═══════════════════════════
      h1("5. Frontend — File-by-File Documentation"),
      p("The frontend is a React 18 SPA built with Vite. All routing is client-side via React Router v6. State management is local useState — no Redux or Zustand needed for this scale. Styling uses Tailwind CSS v3 utility classes."),
      p(""),

      h2("5.1  Root Files"),
      fileTable([
        ["main.jsx",           "React 18 entry point — mounts App into #root div"],
        ["App.jsx",            "Route definitions for all 5 roles + Guard component for auth protection"],
        ["utils.js",           "safeArray(), getStatus(), deadlinePassed(), filterForSDW(), filterForHoD(), isCentralEvent() — used across every page"],
        ["constants.js",       "STATUS_META map: status string → {label, badge CSS class}. APP_NAME, WORKFLOW_STEPS"],
        ["index.css",          "Tailwind directives + custom component classes: .glass-card, .btn, .btn-outline, .badge-*, .skeleton, animations"],
        ["api/axios.js",       "Axios instance with baseURL from VITE_API_URL env var. Request interceptor adds Authorization: Bearer <token>. Response interceptor catches 401 and redirects to login."],
      ]),
      p(""),
      h3("utils.js — the most important utility file"),
      p("Every single page in the application imports from utils.js. The most critical function is getStatus(event) which normalises the event status field to an uppercase string regardless of whether Spring Boot serialised the Java enum as a string 'PENDING_HOD' or as an object {name:'PENDING_HOD'}. Without this, tab filtering would silently return empty arrays."),
      p(""),
      h3("App.jsx — Guard component"),
      p("The Guard wrapper component checks two conditions: (1) is there a user in localStorage? (2) does the user's role match the allowed roles for this route? If either fails, it redirects to /login. This is client-side route guarding — it protects the UI. The backend JWT filter provides server-side protection independently."),
      p(""),

      h2("5.2  components/ — Reusable UI"),
      fileTable([
        ["Sidebar.jsx",          "Role-specific navigation menu with gradient theme per role. Active route highlighted. Analytics link for staff roles."],
        ["DashboardLayout.jsx",  "Wrapper: Sidebar + sticky top bar + main content area. Used by every protected page."],
        ["PageHeader.jsx",       "Consistent page title + subtitle + optional action slot (e.g. Create Event button)"],
        ["StatCard.jsx",         "Animated gradient icon card for dashboard KPIs. Accepts label, value, icon, color props."],
        ["WorkflowBadge.jsx",    "Visual pipeline showing Faculty→SDW→HoD steps. Each step is done/active/rejected/pending. CRITICAL: uses activeStep/doneUpTo maps to correctly colour FACULTY_APPROVED (both Faculty steps green, SDW amber)."],
        ["ApprovalModal.jsx",    "Modal for review action — approve/reject radio + mandatory comment textarea. Used by Faculty, SDW, HoD approval pages."],
        ["EventDetailDrawer.jsx","Side drawer showing full event details. showBudget={false} on student pages hides reviewer comments and budget breakdown. showBudget={true} for staff shows everything."],
        ["EventCard.jsx",        "Card component used in student browse views. Handles multi-day date display, deadline warning, full/closed states."],
      ]),
      p(""),
      h3("WorkflowBadge.jsx — the tricky one"),
      p("This component had the hardest bug to fix. When status is FACULTY_APPROVED, the pipeline shows Faculty steps (0 and 1) as done (green) and SDW step (2) as active (amber). The naive implementation used stepIdx === currentIdx → 'active' which meant step 1 (Faculty Approved) showed as amber when it should be green. The fix uses two lookup tables: activeStep maps each status to which step index is currently waiting, and doneUpTo maps each status to which steps are completely finished."),
      p(""),

      h2("5.3  pages/ — Route Components"),
      h3("Public Pages"),
      fileTable([
        ["HomePage.jsx",  "Public landing page — fetches /events/approved, filters by deadline not passed, no login required. Shows event cards with Register (redirects to login)."],
        ["Login.jsx",     "Split layout: brand panel + form. One-click test credential fill. Stores full user object including JWT token in localStorage."],
        ["Signup.jsx",    "3-step wizard: (1) Role selection cards, (2) Common fields, (3) Role-specific fields with dropdowns. Faculty step has checkbox list of clubs. SDW step explains Dean vs Dept coordinator."],
      ]),
      p(""),
      h3("Student Pages (src/pages/student/)"),
      fileTable([
        ["StudentDashboard.jsx",    "Shows live events as grid cards with Register button. Deadline guard shows 'Registration Closed' badge. Seat count from /registrations/event/{id}/count. Upcoming events section for already-registered events."],
        ["StudentEvents.jsx",       "Browse with search + category filter + free-only toggle. Identical registration logic to dashboard."],
        ["StudentRegistrations.jsx","My registrations history — all events registered for, with status badge and attendance result post-event."],
      ]),
      p(""),
      h3("Organizer Pages (src/pages/organizer/)"),
      fileTable([
        ["OrganizerDashboard.jsx",    "Lists organizer's events with WorkflowBadge. Action hints: Submit Budget (FACULTY_APPROVED), Edit (rejected states), Post-Event Report (APPROVED + event ended). APPROVED + not ended = locked with message."],
        ["CreateEvent.jsx",           "Multi-section form: Basic Info, Type & Theme, Dates & Venue, Coordinators (add/remove), Fees/Prizes, Budget (REQUIRED). Department field is a dropdown. Handles edit mode via useParams id."],
        ["SubmitBudget.jsx",          "Available only after FACULTY_APPROVED. Breakdown form: venue/food/decor/printing/other + notes. Submits to /events/{id}/budget → status becomes PENDING_SDW."],
        ["OrganizerParticipants.jsx", "Event selector on left, participant list on right. Toggle attendance only during active event window (isOngoing() checks startDate ≤ now ≤ endDate). CSV download available post-event."],
        ["PostEventReport.jsx",       "Blocked if event hasn't ended (shows countdown). File upload (PDF/doc/image, max 5MB read as base64). Budget variance display: actual vs estimated."],
      ]),
      p(""),
      h3("Faculty Pages (src/pages/faculty/)"),
      fileTable([
        ["FacultyDashboard.jsx",  "Loads all events, filters by faculty's clubNames (comma-split). Shows pending count and quick-access list."],
        ["FacultyApprovals.jsx",  "3 tabs: Pending Review / Approved / Rejected. Shows only this faculty's clubs' events. Forward-to-Dean button for central events in FACULTY_APPROVED tab."],
        ["FacultyReports.jsx",    "Post-event reports submitted by organizers. Download attendance CSV. View/download PDF reports."],
      ]),
      p(""),
      h3("SDW Pages (src/pages/sdw/)"),
      fileTable([
        ["SDWDashboard.jsx",  "filterForSDW(all, user.department) — dept SDW sees only their dept, SDW Dean (no dept) sees all."],
        ["SDWApprovals.jsx",  "4 tabs: Pending Review / Approved by Me / Rejected / Forwarded to HoD. Review button on PENDING_SDW tab. Forward button on SDW_APPROVED tab."],
      ]),
      p(""),
      h3("HoD Pages (src/pages/hod/)"),
      fileTable([
        ["HoDDashboard.jsx",  "filterForHoD — HoD sees only their department's events. Shows pipeline summary."],
        ["HoDApprovals.jsx",  "3 tabs: Pending Final / Approved (Live) / Rejected. Final approval makes event APPROVED and visible to students."],
      ]),
      p(""),
      h3("Analytics Page (src/pages/analytics/Analytics.jsx)"),
      p("The USP feature. Loads all events and /events/analytics. Renders 4 Recharts charts: Area chart for monthly trend (created vs approved), Horizontal bar for events by department, Pie chart for approval pipeline status distribution, Bar chart for events by category. Quick insight cards: Most Active Club, Post-Event Report completion rate, Rejection Rate."),
      divider(),

      // ═══ SECTION 6: DEPLOYMENT GUIDE ══════════════════════════════════════
      h1("6. Deployment Guide — Step by Step (100% Free)"),
      p("EventPulse uses three free cloud services: Supabase (PostgreSQL database), Railway (Spring Boot backend), and Vercel (React frontend)."),
      p(""),

      h2("STEP 0 — Supabase Database Setup (Do this FIRST)"),
      p("This is the most critical step. Old database rows must be fixed before Spring Boot starts."),
      p(""),
      p("1. Go to supabase.com → Your project → SQL Editor"),
      p("2. Paste and run the following SQL:"),
      code("-- Fix old status values (root cause of empty approval pages)"),
      code("UPDATE events SET status = 'PENDING_FACULTY'"),
      code("  WHERE status IN ('PENDING_APPROVAL','DRAFT','PENDING','draft');"),
      code(""),
      code("ALTER TABLE events ALTER COLUMN status TYPE VARCHAR(50);"),
      code("ALTER TABLE users  ALTER COLUMN year   TYPE VARCHAR(10);"),
      code(""),
      code("-- Add all new columns (safe to re-run)"),
      code("ALTER TABLE users"),
      code("  ADD COLUMN IF NOT EXISTS mobile_number   VARCHAR(15),"),
      code("  ADD COLUMN IF NOT EXISTS club_department VARCHAR(100),"),
      code("  ADD COLUMN IF NOT EXISTS subject         VARCHAR(200),"),
      code("  ADD COLUMN IF NOT EXISTS specialization  VARCHAR(200),"),
      code("  ADD COLUMN IF NOT EXISTS club_names      TEXT;"),
      code(""),
      code("-- Verify"),
      code("SELECT status, COUNT(*) FROM events GROUP BY status;"),
      p(""),

      h2("STEP 1 — Add JWT to pom.xml"),
      p("Open backend/eventmanagement/pom.xml and add inside <dependencies>:"),
      code("<dependency>"),
      code("  <groupId>io.jsonwebtoken</groupId>"),
      code("  <artifactId>jjwt-api</artifactId>"),
      code("  <version>0.11.5</version>"),
      code("</dependency>"),
      code("<dependency>"),
      code("  <groupId>io.jsonwebtoken</groupId>"),
      code("  <artifactId>jjwt-impl</artifactId>"),
      code("  <version>0.11.5</version>"),
      code("  <scope>runtime</scope>"),
      code("</dependency>"),
      code("<dependency>"),
      code("  <groupId>io.jsonwebtoken</groupId>"),
      code("  <artifactId>jjwt-jackson</artifactId>"),
      code("  <version>0.11.5</version>"),
      code("  <scope>runtime</scope>"),
      code("</dependency>"),
      p(""),

      h2("STEP 2 — Push to GitHub"),
      p("Run these commands from your project root (D:\\Spring Boot\\campus-event-management):"),
      code("git add -A"),
      code("git commit -m \"EventPulse: complete production build\""),
      code("git push origin main --force"),
      p(""),

      h2("STEP 3 — Deploy Backend on Railway"),
      p("Railway is free for 500 hours/month — enough for demos and college use."),
      p(""),
      p("1. Go to railway.app → Sign up with GitHub"),
      p("2. New Project → Deploy from GitHub repo → Select your repository"),
      p("3. Railway auto-detects Spring Boot. Go to Settings → Service"),
      p("4. Set Root Directory to:  backend/eventmanagement"),
      p("5. Go to Variables tab → Add ALL of these:"),
      p(""),
      infoTable([
        ["DATABASE_URL",      "jdbc:postgresql://aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?sslmode=require&prepareThreshold=0"],
        ["DATABASE_USERNAME", "postgres.your_project_ref (from Supabase → Settings → Database)"],
        ["DATABASE_PASSWORD", "Your Supabase database password"],
        ["PORT",              "8080"],
        ["FRONTEND_URL",      "(leave blank for now — add after Vercel deploy)"],
        ["JWT_SECRET",        "any-random-string-at-least-32-characters-long"],
      ]),
      p(""),
      p("6. Click Deploy. Wait 3-4 minutes for build."),
      p("7. Copy your Railway URL: https://your-app.up.railway.app"),
      p(""),

      h2("STEP 4 — Deploy Frontend on Vercel"),
      p("Vercel is 100% free for personal/student projects."),
      p(""),
      p("1. Go to vercel.com → Sign up with GitHub"),
      p("2. New Project → Import from GitHub → Select your repository"),
      p("3. Configure:"),
      infoTable([
        ["Framework Preset", "Vite"],
        ["Root Directory",   "frontend"],
        ["Build Command",    "npm run build"],
        ["Output Directory", "dist"],
      ]),
      p("4. Add Environment Variable:"),
      infoTable([
        ["VITE_API_URL", "https://your-app.up.railway.app  (your Railway URL from Step 3)"],
      ]),
      p("5. Click Deploy. Wait 1-2 minutes."),
      p("6. Copy your Vercel URL: https://eventpulse.vercel.app"),
      p(""),

      h2("STEP 5 — Connect Frontend to Backend"),
      p("1. Go back to Railway → your project → Variables"),
      p("2. Update FRONTEND_URL = https://eventpulse.vercel.app (your Vercel URL)"),
      p("3. Click Redeploy"),
      p(""),
      p("Your system is now live. Verify by visiting your Vercel URL — you should see the EventPulse home page."),
      p(""),

      h2("STEP 6 — Create Demo Accounts (in this exact order)"),
      infoTable([
        ["1. HoD",             "Department: Computer Science & Engineering"],
        ["2. SDW Dean",        "Department: LEAVE BLANK (sees all departments)"],
        ["3. SDW Dept",        "Department: Computer Science & Engineering"],
        ["4. Faculty Advisor", "Department: CSE, Clubs: check 'CSI' from the list"],
        ["5. Organizer",       "Department: CSE, Club: CSI, Club Dept: CSE"],
        ["6. Student",         "Department: CSE, Year: SE, Division: A"],
      ]),
      divider(),

      // ═══ SECTION 7: TEAM DISTRIBUTION ═════════════════════════════════════
      h1("7. Team Work Distribution"),
      p("This section documents the logical division of work for a 3-member team and can be used for project submission."),
      p(""),

      h2("Team Member 1 — Backend Developer"),
      h3("Responsibilities"),
      bullet("Spring Boot project setup, pom.xml dependencies, application.properties"),
      bullet("All JPA Entity models: User.java, Event.java, Registration.java, Attendance.java"),
      bullet("All Repository interfaces with custom @Query methods"),
      bullet("AuthService.java — BCrypt integration, signup validation, login"),
      bullet("EventService.java — complete state machine logic (9 statuses, 7 transitions)"),
      bullet("AttendanceService.java and RegistrationService.java"),
      bullet("JWT implementation: JwtUtil.java, JwtFilter.java, SecurityConfig.java"),
      bullet("CORS configuration: WebConfig.java"),
      bullet("Database migrations: migration_final.sql, clear_and_reset_db.sql"),
      bullet("Railway deployment configuration"),
      p(""),
      h3("Key Technical Contributions"),
      p("Designed the state machine that drives the entire approval workflow. Made the critical architectural decision to store Event.status as String instead of Enum — this fixed the production bug where Hibernate silently returned empty lists for old database rows with legacy status values."),
      p(""),

      h2("Team Member 2 — Frontend Core + Auth"),
      h3("Responsibilities"),
      bullet("React project setup with Vite, Tailwind CSS configuration"),
      bullet("App.jsx — routing, Guard component, role-based protection"),
      bullet("Authentication pages: Login.jsx (split layout), Signup.jsx (3-step wizard with dropdowns)"),
      bullet("Shared utilities: utils.js (safeArray, getStatus, filterForSDW, filterForHoD, filterForFacultyApproval)"),
      bullet("Constants and StatusMeta mapping: constants.js"),
      bullet("All reusable components: Sidebar, DashboardLayout, StatCard, PageHeader, ApprovalModal, WorkflowBadge"),
      bullet("EventDetailDrawer with showBudget flag to hide reviewer comments from students"),
      bullet("Axios instance with JWT interceptors: api/axios.js"),
      bullet("Public HomePage showing live events"),
      bullet("Vercel deployment and vercel.json SPA routing config"),
      p(""),
      h3("Key Technical Contributions"),
      p("Built the getStatus() normalisation function that fixed the most persistent frontend bug — where tab filtering returned empty because Spring Boot could serialise Java enums as either strings or objects. Built the multi-step Signup wizard with role-specific forms and dropdown-driven club/department selection to prevent data inconsistency."),
      p(""),

      h2("Team Member 3 — Feature Pages + Analytics"),
      h3("Responsibilities"),
      bullet("All Student pages: StudentDashboard, StudentEvents, StudentRegistrations"),
      bullet("All Organizer pages: OrganizerDashboard, CreateEvent, SubmitBudget, OrganizerParticipants, PostEventReport"),
      bullet("All Faculty pages: FacultyDashboard, FacultyApprovals, FacultyReports"),
      bullet("All SDW pages: SDWDashboard, SDWApprovals"),
      bullet("All HoD pages: HoDDashboard, HoDApprovals"),
      bullet("Analytics dashboard: Recharts area chart, bar chart, pie chart, quick insight cards"),
      bullet("Attendance marking with time-window enforcement (isOngoing() function)"),
      bullet("Registration deadline guard — 'Registration Closed' badge"),
      bullet("CSV export for attendance and event reports"),
      bullet("Post-event report with file upload (base64 PDF)"),
      p(""),
      h3("Key Technical Contributions"),
      p("Implemented the WorkflowBadge component with correct visual state for all 9 status values. Built the Analytics USP page using Recharts. Implemented the attendance timing restriction — attendance can only be toggled during the active event window, read-only before and after. Handled all edge cases in the organizer flow (locked events, pending reports, etc.)."),
      divider(),

      // ═══ SECTION 8: PROFESSIONAL REPORT SUMMARY ══════════════════════════
      h1("8. Professional Report Summary"),
      p(""),
      h2("Abstract"),
      p("EventPulse is a full-stack Role-Based Access Control (RBAC) web application designed for campus event lifecycle management. It implements a 5-stage institutional approval workflow — from organizer proposal through Faculty Advisor, SDW Coordinator, and Head of Department review — with JWT-based stateless authentication, attribute-based data scoping, and a real-time analytics dashboard. The system is deployed on cloud infrastructure (Vercel + Railway + Supabase) and is production-ready."),
      p(""),
      h2("Technology Justification"),
      infoTable([
        ["React 18 + Vite",    "Fast HMR in development, optimised production bundle, native ES modules"],
        ["Spring Boot 4",      "Auto-configuration, embedded Tomcat, Spring Data JPA, Spring Security"],
        ["PostgreSQL (Supabase)","ACID compliance, foreign key constraints, free managed cloud hosting"],
        ["Tailwind CSS",       "Utility-first — consistent spacing/colour system, zero CSS conflicts"],
        ["JWT (JJWT 0.11.5)", "Stateless auth — no session storage, scales horizontally, standard RFC 7519"],
        ["BCrypt",             "Adaptive password hashing — work factor prevents brute force at scale"],
        ["Recharts",           "React-native chart library built on D3 — composable, animated, responsive"],
      ]),
      p(""),
      h2("Security Implementation"),
      bullet("Authentication: BCrypt (10 rounds) password hashing — never plaintext"),
      bullet("Authorisation: JWT Bearer token validated on every protected request"),
      bullet("Data Scoping: Faculty sees only their clubs; SDW sees only their department"),
      bullet("Comment Privacy: Reviewer comments (faculty/sdw/hod) never shown to students"),
      bullet("Duplicate Prevention: UNIQUE(student_id, event_id) enforced at database level"),
      bullet("State Machine: Invalid workflow transitions rejected server-side regardless of API caller"),
      bullet("Circular JSON: @JsonIgnoreProperties on all entity relationships"),
      p(""),
      h2("Known Limitations and Future Enhancements"),
      bullet("Currently stores JWT in localStorage — production upgrade: HttpOnly cookie with refresh token rotation"),
      bullet("Role checks in application logic — future: Spring Security @PreAuthorize method-level security"),
      bullet("No email notifications — future: Spring Mail for approval status emails"),
      bullet("Report files stored as base64 in database — future: Supabase Storage or AWS S3"),
      bullet("No rate limiting on auth endpoints — future: Bucket4j integration for brute force protection"),

      p(""),
      h2("Conclusion"),
      p("EventPulse successfully demonstrates full-stack development competency across identity and access management, stateful workflow design, secure API development, and modern frontend engineering. The system handles real institutional complexity — multi-department scoping, central vs department event routing, and a traceable multi-actor approval chain — making it suitable not only as a college project but as a foundation for production campus administrative software."),

    ]
  }]
});

Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync('D:\Spring Boot\campus-event-management\EventPulse_Documentation.docx', buffer);
  console.log('Document created successfully');
});