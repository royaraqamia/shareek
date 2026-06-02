# Shareek ERP: Architectural Research & Technical Specification Report

---

### 1. MARKET STANDARDS & DESIGN SYSTEM

#### Competitor Analysis

| Competitor | Market Segment | Strengths | Weaknesses (MVP Opportunities) |
| :--- | :--- | :--- | :--- |
| **Daftra** | MENA Cloud ERP | Extensive Arabic localization, local tax compliance (ZATCA), modular structure. | High visual density, steep learning curve, dated mobile interface, laggy client-side transitions. |
| **Wafeq** | Gulf Accounting / SaaS | Strong e-invoicing API integration, clean modern layout, optimized for accountants. | Lacks robust front-of-house operations features for non-accountant business owners. |
| **Foodics** | F&B / POS & Inventory | Excellent offline support, mobile/tablet application UI optimized for fast operations. | Over-specialized in F&B; lacks generalized B2B invoice-to-purchase flow. |

#### Expected Industry UI/UX Patterns
1. **Bidirectional Layout Integrity (RTL / LTR):** Dynamic layout flipping based on locale. Use of CSS logical properties (`margin-inline-start` / `ps-*`, `padding-inline-end` / `pe-*`) instead of directional positioning (`pl-*`, `pr-*`).
2. **Tabular Data Density:** High information density tables with customizable visible columns, multi-column sorting, sticky headers, and quick pagination controls.
3. **Optimized Number Formatting:** Multi-currency display with regional decimal alignments (e.g., standardizing on 2 decimal places for AED/SAR/EGP).
4. **Touch-Friendly Form Factors:** Large input targets and clear visual states (minimum 44px tap target height) to accommodate tablet-based retail environments.
5. **Scan-and-Action Workflows:** Input fields that auto-focus to capture barcode scanner entries without manual clicks.

#### Design Vibe & Tokens
* **Aesthetic Theme:** Clean, high-contrast, structural minimalism. Designed to reduce cognitive load during long work hours in bright warehouse or retail environments.
* **Default Theme:** Light Mode (High Contrast).
* **Secondary Theme:** Dark Mode (Battery preservation and low-light environments).

##### Color Palette (Tailwind Tokens)
* **Primary (Brand / Trust / Growth):** Emerald (`emerald-600` / `#059669` as default; `emerald-500` in dark mode) to signify financial growth and align with MENA design preferences.
* **Secondary (Interactive UI):** Indigo (`indigo-600` / `#4f46e5`).
* **Neutrals (Structure):** Slate (`slate-900` for primary text, `slate-500` for secondary text, `slate-50` for background).
* **Feedback States:**
  * Success: Emerald (`emerald-600`)
  * Warning: Amber (`amber-500`)
  * Destructive: Red (`red-600`)

##### Typography (Dual-Language Scale)
* **Arabic Font Family:** `Tajawal`, sans-serif (fluid baseline, high legibility in small table views).
* **Latin Font Family:** `Inter`, sans-serif.
* **Base Size:** `14px` (`text-sm`) to support standard data-dense tabular environments.

##### Critical Atomic Components (Shadcn UI Mappings)
* **Data Table (`<DataTable />`):** Houses paginated inventory lists, sales tracking, and client directories.
* **Command Dialog (`<Command />`):** Fast global navigation and search overlay (triggered via `Cmd+K` / `Ctrl+K`).
* **Select Combobox (`<Popover />` + `<Command />`):** Fuzzy search selector for high-velocity product adding within transactional forms.
* **Sheet (`<Sheet />`):** Contextual detail panes (e.g., sliding out a client's historical purchases without leaving the current view).
* **Feedback Badges (`<Badge />`):** Colored visual indicators depicting Payment Status (Paid, Partial, Unpaid) or Inventory Levels (In Stock, Low Stock, Out of Stock).

---

### 2. CORE ENTITIES & RELATIONAL ARCHITECTURE

#### Database Design Principles
* Multi-tenant architecture isolated at the database level using `organization_id` on every core table.
* Strict PostgreSQL Row-Level Security (RLS) rules enabled by default in Supabase.
* Audit columns (`created_at`, `updated_at`, `created_by`) required on all mutable tables.

#### Core Relational Schema

```mermaid
erDiagram
    ORGANIZATION ||--|{ PROFILE : contains
    ORGANIZATION ||--|{ CONTACT : manages
    ORGANIZATION ||--|{ PRODUCT_OR_SERVICE : catalogs
    ORGANIZATION ||--|{ TRANSACTION : records

    CONTACT ||--o{ TRANSACTION : associated_with

    TRANSACTION ||--|{ TRANSACTION_ITEM : includes
    PRODUCT_OR_SERVICE ||--|{ TRANSACTION_ITEM : referenced_by

    ORGANIZATION {
        uuid id PK
        varchar name
        varchar tax_number NULL
        varchar currency
        timestamp created_at
    }

    PROFILE {
        uuid id PK
        uuid organization_id FK
        varchar email
        varchar role
        varchar full_name
        timestamp created_at
    }

    CONTACT {
        uuid id PK
        uuid organization_id FK
        varchar type "CLIENT or SUPPLIER"
        varchar name
        varchar phone NULL
        varchar email NULL
        timestamp created_at
    }

    PRODUCT_OR_SERVICE {
        uuid id PK
        uuid organization_id FK
        varchar name
        varchar sku NULL
        numeric sale_price
        numeric purchase_price
        integer current_stock
        boolean is_service
        timestamp created_at
    }

    TRANSACTION {
        uuid id PK
        uuid organization_id FK
        uuid contact_id FK
        varchar type "SALE or PURCHASE"
        varchar reference_number
        numeric subtotal
        numeric tax_rate
        numeric total_amount
        varchar payment_status "PAID, PARTIAL, UNPAID"
        timestamp transaction_date
        timestamp created_at
    }

    TRANSACTION_ITEM {
        uuid id PK
        uuid transaction_id FK
        uuid product_id FK
        integer quantity
        numeric unit_price
        numeric total_price
    }
```

---

### 3. STRICT INFORMATION ARCHITECTURE & ROUTING

The application employs Next.js App Router syntax. Internationalization is handled via dynamic locale routes `/[lang]`. All routing maps below assume dynamic language routing (e.g., `/[lang]/dashboard`).

#### Complete Route Directory

| Route Path | Type | Auth Wall | Target Role | Primary View Type / Purpose |
| :--- | :--- | :--- | :--- | :--- |
| `/auth/login` | Public | None | All | Single-column credential validation layout. |
| `/auth/register` | Public | None | All | Multi-step sign-up (User creation, Organization creation). |
| `/dashboard` | Protected | Active Session | All Roles | Widget dashboard featuring sales graphs, stock alerts, and quick actions. |
| `/transactions` | Protected | Active Session | All Roles | Filterable table containing both sales and purchase documents. |
| `/transactions/new` | Protected | Active Session | All Roles | Dynamic layout with form panel and live invoice preview pane. |
| `/transactions/[id]` | Protected | Active Session | All Roles | Printable details layout (including RTL-aligned localized invoice). |
| `/inventory` | Protected | Active Session | All Roles | Dynamic search grid listing items, stock levels, and category groupings. |
| `/contacts` | Protected | Active Session | All Roles | Dual-pane interface (Left: client/supplier list, Right: activity log). |
| `/settings` | Protected | Active Session | Admin Only | Tabbed layout (Organization Details, VAT options, localized invoice templates). |

#### Adaptive Screen Layout & Navigation Strategy

##### Desktop Environment (Viewport >= 1024px)
* **Primary Navigation:** Permanent, collapsible sidebar docked on the leading edge (Start position; Left in LTR, Right in RTL).
* **Interactions:** Detail views utilize sliding dynamic side-drawers (Sheets) to maintain continuous background screen context.

##### Mobile / PWA Environment (Viewport < 1024px)
* **Primary Navigation:** Sticky bottom navigation bar holding the five high-frequency views: *Dashboard, Transactions, Inventory, Contacts, Menu*.
* **Interactions:** Drawers transition into full-screen sliding modal sheets with physical touch-drag handles (`vaul` library implementation via Shadcn Sheet component).
* **Header Stack:** Static header containing current page context title, quick-search icon, and notification center bell.

---

### 4. USER FLOW & STATE MANAGEMENT

#### Core Flow: Creating a Sales Invoice (Interactive UI Step-by-Step)
The following state flow visualizes the client-side lifecycle of generating a transactional invoice using Zustand and Next.js Server Actions.

```mermaid
sequenceDiagram
    autonumber
    actor User as Business Owner (UI)
    participant Store as Zustand State Store (Draft Sales Invoice)
    participant Action as Server Action (createInvoice)
    database DB as Supabase Postgres

    User->>Store: Initialize Draft (Sets defaults: date, current user)
    User->>Store: Select Contact (Client metadata set)
    User->>Store: Add Item (Appends SKU, Qty, Unit Price)
    Store->>Store: Run Calculation (Subtotal, VAT, Grand Total)
    User->>Store: Click Submit "Issue Invoice"
    Store->>Action: Dispatch Form Payload (Strict validation)
    alt Validation Failure
        Action-->>User: Return Validation Error Array
    else Validation Success
        Action->>DB: Execute Transactional SQL Query
        DB-->>Action: Confirm Row Creation & Stock Decr.
        Action-->>User: Return Redirect Payload (Invoice ID)
    end
```

#### Client-side State Definition (Zustand Store)

```typescript
import { create } from 'zustand';

interface InvoiceLineItem {
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface InvoiceDraftState {
  contactId: string | null;
  items: InvoiceLineItem[];
  taxRate: number; // e.g., 0.15 for ZATCA standard 15% VAT
  subtotal: number;
  totalAmount: number;
  
  // Actions
  setContact: (contactId: string) => void;
  addItem: (item: Omit<InvoiceLineItem, 'totalPrice'>) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, qty: number) => void;
  resetDraft: () => void;
}

export const useInvoiceStore = create<InvoiceDraftState>((set) => ({
  contactId: null,
  items: [],
  taxRate: 0.15, 
  subtotal: 0,
  totalAmount: 0,

  setContact: (contactId) => set({ contactId }),

  addItem: (newItem) => set((state) => {
    const existingIndex = state.items.findIndex(i => i.productId === newItem.productId);
    let updatedItems = [...state.items];
    
    if (existingIndex > -1) {
      const currentQty = updatedItems[existingIndex].quantity + newItem.quantity;
      updatedItems[existingIndex] = {
        ...updatedItems[existingIndex],
        quantity: currentQty,
        totalPrice: currentQty * updatedItems[existingIndex].unitPrice
      };
    } else {
      updatedItems.push({
        ...newItem,
        totalPrice: newItem.quantity * newItem.unitPrice
      });
    }

    const subtotal = updatedItems.reduce((acc, item) => acc + item.totalPrice, 0);
    const totalAmount = subtotal * (1 + state.taxRate);

    return { items: updatedItems, subtotal, totalAmount };
  }),

  removeItem: (productId) => set((state) => {
    const updatedItems = state.items.filter(item => item.productId !== productId);
    const subtotal = updatedItems.reduce((acc, item) => acc + item.totalPrice, 0);
    const totalAmount = subtotal * (1 + state.taxRate);
    return { items: updatedItems, subtotal, totalAmount };
  }),

  updateQuantity: (productId, qty) => set((state) => {
    const updatedItems = state.items.map(item => {
      if (item.productId === productId) {
        return { ...item, quantity: qty, totalPrice: qty * item.unitPrice };
      }
      return item;
    });
    const subtotal = updatedItems.reduce((acc, item) => acc + item.totalPrice, 0);
    const totalAmount = subtotal * (1 + state.taxRate);
    return { items: updatedItems, subtotal, totalAmount };
  }),

  resetDraft: () => set({ contactId: null, items: [], subtotal: 0, totalAmount: 0 })
}));
```

#### Critical UI States & Edge Cases

##### 1. Loading States
* **Grid Views (e.g., Transactions Table):** Render structural CSS animated pulse skeletons (`<Skeleton className="h-10 w-full" />`) matching page-level densities to avoid layout shifting (CLS).
* **Form Submissions (e.g., Submitting Invoice):** 
  * Replace "Submit" text with dynamic localized spinner (`<Loader2 className="animate-spin" />`).
  * Add state-level page block flags on the container, preventing duplicate form submissions.
  * Inputs and buttons elements toggle dynamically to `disabled={isPending}` during transition periods.

##### 2. Empty States
* **Dynamic Search Query Result Empty State:** Present immediate option to reset parameters. Form styling matches:
  * "No search results match current parameters" text.
  * Redundant primary action button labeled "Clear Search Filters".
* **Core Collection Empty State (e.g., First-time user dynamic load):** Explicit call-to-action cards containing contextual guidance:
  * Icon: Decorative dashed boundary with product graphic context.
  * Header text: "Add your first inventory product".
  * Subtext: "You cannot record sales or purchases until products or services are cataloged".
  * Primary Button: "+ Create Product Record".

##### 3. Error States
* **Input-Level Form Validation Failure:** Render input fields in active red destructive stroke color (`ring-red-500 border-red-500`). Output helpful text directly beneath invalid nodes using `<span className="text-xs text-destructive">`.
* **Database/Network Operations Error:** Handle server transaction exceptions cleanly by returning error maps from actions. Render interactive toasts:
  * Component: `toast({ variant: "destructive", title: "Action Failed", description: error.message })`.
  * Trigger: Caught promise block or return value assertion within transaction creation handler.

##### 4. Success States
* **Form Submission Completion:** Real-time feedback trigger signaling success state.
  * Component: Toast notifications matching color values (`bg-emerald-600 text-white`).
  * Text output: "Invoice Created successfully".
  * Redirect handling: Programmatically transition user window context (`router.push('/transactions/[new_id]')`) to focus directly on print/PDF view options.

---

### 5. EXTERNAL INTEGRATIONS & DEPENDENCIES

The MVP prioritizes minimized cloud architecture boundaries to limit latency. Out-of-scope billing processes are excluded entirely from this structural list.

#### 1. Supabase Services
* **PostgreSQL Database:** Primary persistent data repository. Handles data partitioning via schemas and enforces multi-tenant row isolation.
* **Supabase Authentication:** Passwordless magic-link authentication or standard email/password combination flows.
* **Supabase Storage:** Encapsulates PDF document output, client invoices, business branding assets, and product catalog icons.

#### 2. Resend Email Delivery
* **Transactional Mail Gateway:** Automated delivery pipeline handling:
  * Account invitations to staff profiles (`/settings` panel action).
  * Direct transactional email dispatches containing PDF invoice records directly to contact records.

#### 3. Edge Deployment Services (Vercel)
* **Application Edge Network Routing:** Hosts serverless runtime engine configurations with regional CDN routing targeting the Middle East (e.g., `me-central1` zone endpoints where compatible) to optimize transactional speeds for users in Riyadh, Dubai, and Cairo.