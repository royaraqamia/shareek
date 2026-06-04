# Shareek ERP

> A high-performance, RTL-first, multi-tenant Enterprise Resource Planning (ERP) platform and progressive web application optimized for Arab business owners in the Middle East.

---

## 🛠 Tech Stack

Shareek ERP leverages a modern, serverless-oriented web stack designed for low latency, absolute multi-tenant data isolation, and smooth responsive screen layouts.

| Category | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend Framework** | [Next.js 15+ (App Router)](https://nextjs.org/) | React Server Components (RSC) for instantaneous page loads, Server Actions for mutations. |
| **Styling & Theme** | [Tailwind CSS v4](https://tailwindcss.com/) | Mobile-first visual layouts, RTL/LTR bidirectional flexibility, utility classes. |
| **Component Library** | [Shadcn UI](https://ui.shadcn.com/) | Accessible, non-opinionated interactive UI primitives (Dialogs, Tables, Alerts, Sheets). |
| **State Management** | [Zustand](https://zustand-demo.pmnd.rs/) | Lightweight, persistent client-side store managing transactional invoice drafts. |
| **Database** | [PostgreSQL (Supabase)](https://supabase.com/) | Structural relational datastore enforcing multi-tenant isolation via triggers and Row-Level Security (RLS). |
| **Authentication** | [Supabase Auth](https://supabase.com/docs/guides/auth) | Secure JWT-based session state verification mapped to organization profiles. |
| **Data Validation** | [Zod](https://zod.dev/) | Strict, runtime schema assertion and type-safe API boundary guards. |
| **Testing Harness** | [Vitest](https://vitest.dev/) | High-speed unit and integration testing suite for core business rules and stores. |

---

## 🚀 Key Features (MVP)

Enforced strictly within the bounds of the product design specification and business rules:

1. **RTL-First Localized Engine (Arabic / English)**
   - High-fidelity interface defaults entirely to **Arabic** (using the highly readable `IBM Plex Sans Arabic` typeface) with native RTL alignment.
   - Core direction updates dynamically, persisting preferences safely across sessions.
   
2. **Standardized Sales & Purchase Invoicing**
   - High-performance, client-side draft billing state via `useInvoiceStore`.
   - Automated real-time math engine evaluating **subtotals**, standard **15% local-compliant VAT (ZATCA standards)**, and **grand totals** synchronously.

3. **Secure Inventory Stock Controller**
   - CRUD management over products and services.
   - Smart checkout block: Sales transactions are strictly aborted and rolled back if requested quantities exceed in-stock parameters for tracked merchandise.

4. **Multi-Tenant Customer & Supplier Directory**
   - Dynamic contact onboarding supporting Client (buyer) and Supplier (vendor) classifications.
   - Complete isolation ensures Organization A's contact directories and profiles are completely separate from Organization B's at the database block.

5. **Regional Financial & Organizational Defaults**
   - Tailored settings module for managing commercial tax numbers, local organizations, and default billing formats.

---

## 💻 Local Development & Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (`v20.x` or higher recommended)
- [npm](https://www.npmjs.com/) (`v10.x` or higher)

### Installation
1. Clone the repository and navigate into the project directory:
   ```bash
   git clone https://github.com/your-org/shareek-erp.git
   cd shareek-erp
   ```

2. Install the locked package dependencies:
   ```bash
   npm install
   ```

3. Spin up the localized development server:
   ```bash
   npm run dev
   ```
   *The development server will bootstrap locally on [http://localhost:3000](http://localhost:3000).*

### Running Tests
Shareek ERP uses Vitest for rigorous assertion of financial rules and tenency controls:
```bash
# Run unit and store validation suites
npm run test:all
```

---

## 🔒 Environment Variables

To establish backend database links and initialize the Supabase client wrapper, construct a `.env` file at the root of the project using this schema:

| Variable | Scope | Required | Explanation |
| :--- | :--- | :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | **Client-Safe** | Yes | Your target Supabase project API URL (e.g., `https://xxxx.supabase.co`). |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | **Client-Safe** | Yes | Your project's anonymous client key. Securely safe for browser execution. |

> *Note: Server components dynamically process these variables while client components consume browser-safe API variables prefixed with `NEXT_PUBLIC_` to keep security boundaries secure.*

---

## 📂 Project Structure

A high-level overview of the major features, services, and directory layout within the ERP repository:

```text
├── app/                      # Next.js App Router (Routing and Pages)
│   ├── auth/                 # Unauthenticated LoginPage and Register Onboarding
│   ├── contacts/             # Contact directory management visual sheets
│   ├── dashboard/            # Analytical visual summary widgets & counters
│   ├── inventory/            # Catalog interface (add/edit products & current list)
│   ├── settings/             # Enterprise parameters, tax number adjustments
│   ├── transactions/         # Document histories and multi-item receipt creation (/new)
│   ├── globals.css           # Tailwind v4 import root and CSS rules overrides
│   └── layout.tsx            # Global HTML container with typefaces & toast registers
│
├── components/               # Shareable React visual primitives
│   ├── ui/                   # Decoupled atomic Shadcn interface elements (buttons, inputs)
│   └── AppInitializer.tsx    # Session-hydration and body document-direction coordinator
│
├── docs/                     # Product PRD, architectural and technical specifications
│   ├── prd.md                # Product Requirements Document
│   └── project_overview.md   # Architectural Overview
│
├── features/                 # Modular business domain logic and Server Actions
│   ├── auth/                 # User credentials verification, session bootstrap
│   ├── contacts/             # Create contacts, load suppliers, search clients
│   ├── inventory/            # Inventory CRUD logic with validation checks
│   └── transactions/         # Transaction processing queries and database operations
│
├── lib/                      # Core programmatic configurations
│   └── utils.ts              # Class name merging and visual layout utilities
│
├── store/                    # Domain state managers
│   ├── useAppStore.ts        # Language toggle, dir persistence
│   └── useInvoiceStore.ts    # High-fidelity receipt/invoice builder & calculation rules
│
├── supabase/                 # Infrastructure and database code
│   └── migrations/           # PostgreSQL migrations (DDL tables, triggers, RLS policies)
│
└── tests/                    # Autonomous integration and unit verification tests
    └── erp.test.ts           # Vitest spec files ensuring business constraint safety
```
