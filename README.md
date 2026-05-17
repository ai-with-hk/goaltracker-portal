# 🎯 GoalTracker — In-House Goal Setting & Tracking Portal

A full-featured, enterprise-grade **Goal Setting & Tracking Portal** built for organizational performance management. Supports the complete lifecycle of employee goals — from creation and approval to quarterly check-ins and analytics.

## 🚀 Live Demo

**Demo URL:** [Coming Soon - Deploy to Vercel]

### Quick Login Credentials
| Role | Email | Password |
|------|-------|----------|
| Employee | `employee@demo.com` | `demo123456` |
| Manager | `manager@demo.com` | `demo123456` |
| Admin/HR | `admin@demo.com` | `demo123456` |

## ✨ Features

### Phase 1 — Goal Creation & Approval (Must-Have)
- ✅ Employee goal sheet creation with up to 8 goals
- ✅ Weightage validation (must total 100%, minimum 10% each)
- ✅ 6 Unit of Measurement types (Numeric, Percentage, Timeline, Zero-based)
- ✅ Thrust Area alignment from organizational directory
- ✅ Manager review & approval workflow with feedback
- ✅ Goal locking after approval
- ✅ Shared/cascaded goals from manager to team

### Phase 2 — Quarterly Achievement Tracking
- ✅ Quarterly progress updates (Q1–Q4)
- ✅ Automated progress score calculation per UoM type
- ✅ Manager check-in with comments
- ✅ Visual progress bars with color-coded scoring

### Admin Module
- ✅ Goal Cycle Management (define FY periods, setting windows)
- ✅ User & Organization Management (roles, departments, thrust areas, manager assignments)
- ✅ Goal Unlock with audit trail
- ✅ Full Audit Log viewer for compliance
- ✅ Escalation Engine with configurable rules

### Reports & Analytics (Bonus)
- ✅ Achievement Report with Excel export (SheetJS)
- ✅ Analytics Dashboard with 4 interactive charts (Chart.js)
  - Goal sheet status distribution (Doughnut)
  - QoQ achievement trend (Line)
  - Goals by thrust area (Horizontal Bar)
  - Department completion rate (Stacked Bar)

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + Vite |
| Styling | Vanilla CSS (Custom Design System) |
| Backend | Supabase (PostgreSQL, Auth, RLS) |
| Charts | Chart.js + react-chartjs-2 |
| Export | SheetJS (xlsx) |
| Icons | Lucide React |
| Deployment | Vercel |

## 📦 Installation

```bash
git clone https://github.com/ai-with-hk/goaltracker-portal.git
cd goaltracker-portal
npm install
npm run dev
```

## 🔐 Environment Variables

Create a `.env` file (optional — defaults are pre-configured):

```env
VITE_SUPABASE_URL=https://shpdvmokvxtmfzduysrk.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
```

## 📁 Project Structure

```
src/
├── lib/                    # Utilities & Supabase client
│   ├── supabase.js         # Supabase client config
│   ├── goalCalculations.js # Score engine & validators
│   └── auditLogger.js      # Audit trail helper
├── contexts/
│   └── AuthContext.jsx      # Auth state & role management
├── components/
│   ├── Layout/             # AppLayout, Sidebar, TopBar
│   └── Toast.jsx           # Toast notification system
├── pages/
│   ├── LoginPage.jsx       # Auth with demo quick-access
│   ├── DashboardPage.jsx   # Overview KPIs
│   ├── ReportsPage.jsx     # Excel export
│   ├── AnalyticsPage.jsx   # Chart.js dashboard
│   ├── employee/
│   │   ├── GoalSheetPage.jsx       # Goal creation
│   │   └── QuarterlyUpdatePage.jsx # Achievement entry
│   ├── manager/
│   │   ├── TeamGoalsPage.jsx       # Review & approve
│   │   ├── CheckinPage.jsx         # Periodic feedback
│   │   └── SharedGoalsPage.jsx     # Cascaded goals
│   └── admin/
│       ├── CycleManagementPage.jsx # FY cycle config
│       ├── UserManagementPage.jsx  # Org structure
│       ├── GoalUnlockPage.jsx      # Post-lock edits
│       ├── AuditLogPage.jsx        # Change history
│       └── EscalationPage.jsx      # Auto-escalation
└── index.css               # Complete design system
```

## 🔒 Security

- Row Level Security (RLS) enforced on all Supabase tables
- Role-based access control (Employee, Manager, Admin)
- Audit logging for all post-lock modifications
- JWT-based authentication via Supabase Auth

## 📄 License

MIT