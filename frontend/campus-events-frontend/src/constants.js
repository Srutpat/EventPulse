export const DEPARTMENTS = [
  "Computer Science","Information Technology",
  "Electronics & Telecommunication","Mechanical Engineering",
  "Civil Engineering","Electrical Engineering",
  "Artificial Intelligence & ML","Data Science","Cybersecurity","Other",
];
export const FACULTY_DEPARTMENTS = [
  "Computer Science","Information Technology","Electronics & Telecommunication",
  "Mechanical Engineering","Civil Engineering","Electrical Engineering",
  "Mathematics","Physics","Administration","Other",
];
export const DIVISIONS = ["A","B","C","D","E"];
export const YEARS = [
  {value:"FE",label:"FE — First Year"},{value:"SE",label:"SE — Second Year"},
  {value:"TE",label:"TE — Third Year"},{value:"BE",label:"BE — Final Year"},
];
export const CLUBS = [
  "GDGC","Coding Club","ITSA","Art Circle","ACM",
  "MLSC","IEEE Student Branch","OWASP","Entrepreneurship Cell",
  "MESA","CiESA","AiMSA","CRESA","Central","ETSA",
];
export const CATEGORIES = [
  "Technical","Cultural","Sports","Workshop","Seminar",
  "Hackathon","Guest Lecture","Competition","Fest","Other",
];
export const STATUS_META = {
  PENDING_APPROVAL: {label:"Pending Review",   color:"badge-yellow"},  // legacy
  DRAFT:            {label:"Draft",            color:"badge-gray"  },
  PENDING_FACULTY:  {label:"Pending Faculty",  color:"badge-yellow"},
  FACULTY_APPROVED: {label:"Faculty Approved", color:"badge-blue"  },
  FACULTY_REJECTED: {label:"Faculty Rejected", color:"badge-red"   },
  PENDING_SDW:      {label:"Pending SDW",      color:"badge-yellow"},
  SDW_APPROVED:     {label:"SDW Approved",     color:"badge-blue"  },
  SDW_REJECTED:     {label:"SDW Rejected",     color:"badge-red"   },
  PENDING_HOD:      {label:"Pending HoD",      color:"badge-yellow"},
  HOD_REJECTED:     {label:"HoD Rejected",     color:"badge-red"   },
  APPROVED:         {label:"Approved ✓",        color:"badge-green" },
};
export const WORKFLOW_STEPS = [
  {key:"PENDING_FACULTY", label:"Faculty Review"},
  {key:"FACULTY_APPROVED",label:"Faculty ✓"},
  {key:"PENDING_SDW",     label:"SDW Review"},
  {key:"SDW_APPROVED",    label:"SDW ✓"},
  {key:"PENDING_HOD",     label:"HoD Review"},
  {key:"APPROVED",        label:"Live ✓"},
];

// ── App branding ──────────────────────────────────────────────────────────────
export const APP_NAME    = "EventPulse";
export const APP_TAGLINE = "Where campus events come alive";