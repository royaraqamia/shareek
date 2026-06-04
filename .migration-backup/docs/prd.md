### Core Context Entities

The development of the Shareek ERP MVP is based on the following core data entities:
1. **ORGANIZATION**: Multi-tenant operational boundary isolating all resources and business configurations.
2. **PROFILE**: Identity record linked to Supabase Auth mapping users to parent organizations with strict Roles (Admin/Employee).
3. **CONTACT**: Client or Supplier records associated with transaction records.
4. **PRODUCT_OR_SERVICE**: Inventory items and services utilizing specific stock tracking boundaries.
5. **TRANSACTION & TRANSACTION_ITEM**: Multi-item sales and purchase documents calculating pricing and local sales tax (VAT).

---

### 1. PRODUCT DEFINITION & SCOPE (MVP)

#### Technical Goal
To construct a responsive, localized, and multi-tenant web-based ERP (and progressive web app) tailored for Arab business owners in the Middle East. The system provides RTL-first interfaces to record sales, track purchases, update inventory stock, and maintain customer/supplier directories without billing infrastructure.

#### MoSCoW Feature Allocation (Must-Have Only)
* **Authentication & Tenancy Initialization:** Multi-tenant user registration, passwordless magic-link/password entry, automatic organization schema bootstrapping.
* **Dual-Locale UI Engine:** Absolute layout inversion support (RTL/LTR) with dynamically switched language baselines (Arabic as default, English as alternative).
* **Inventory Catalog:** Full CRUD operations on items, real-time stock-on-hand tracking, and auto-validation of stock levels.
* **Contact Directory:** Directory for managing dynamic customer profiles (Clients) and vendor records (Suppliers).
* **Billing & Document Generator:** Creation of sales invoices and purchase bills, local tax rate calculators (static 15% VAT baseline), and print-ready dynamic outputs.

#### Feature-to-Route Mapping

| Must-Have Feature | Route Path / Target Route | View Pattern / Layout Framework |
| :--- | :--- | :--- |
| Auth & Tenant Onboarding | `/auth/register` \| `/auth/login` | Unauthenticated single-column forms |
| ERP Performance Metrics | `/dashboard` | Protected modular Grid UI with statistical widgets |
| Line-Item Billing Form | `/transactions/new` | High-fidelity interactive receipt/invoice state store |
| Document Register | `/transactions` | Advanced filtering tabular grid |
| Printable Invoices | `/transactions/[id]` | Web-native standard print grid rendering localized QR signatures |
| Product & Stock Catalog | `/inventory` | Search-optimized inventory tables |
| Client/Vendor Registry | `/contacts` | Dual-pane master-detail viewport |
| Regional & Tax Config | `/settings` | Static form interface with tabs |

#### Negative Scope (MVP Exclusions)
* Payment processing gateways or payment links.
* Dynamic multi-warehouse inventories (single-pool tracking only).
* Barcode scanner camera API bindings (manual alphanumeric keypad inputs only).
* Multi-currency support (system-wide single currency locked per organization).
* Automated accounting general ledgers or bank account integration feeds.

---

### 2. CORE FUNCTIONAL REQUIREMENTS (System Logic & Architecture)

#### System Execution Logic
* **The system must** execute all write queries modifying critical inventory limits and financial aggregates inside single, atomic database transactions.
* **The system must** validate that the caller's verified `organization_id` strictly matches the owner organizational context of the mutated records before executing any modification.
* **The system must NOT** allow any inventory product records to drop below zero (0) stock units for sales transactions. 
  * *Fallback Behavior:* If an invoice request requires quantities exceeding standard stock availability, the API endpoint must abort the transaction and return:
    ```json
    { "success": false, "code": "INSUFFICIENT_STOCK", "message": "Transaction aborted due to insufficient inventory limits on selected items." }
    ```
* **The system must NOT** allow mutations of items, contacts, or transactions across mismatched tenant boundaries.
  * *Fallback Behavior:* If a client sends an unauthorized tenant reference, the Server Action must throw an exception and return:
    ```json
    { "success": false, "code": "TENANT_ACCESS_DENIED", "message": "Access restricted: unauthorized tenant boundary action." }
    ```

#### Target Deployment Infrastructure
* **Target Runtime:** Vercel Edge/Serverless platform using Next.js App Router.
* **Data Storage Layer:** Supabase PostgreSQL instance with Row Level Security (RLS) enabled.
* **Asset Storage:** Supabase Storage buckets configured with private read/write access.

```
                  +-----------------------------------+
                  |           Vercel Edge             |
                  |     (Next.js Server Actions)      |
                  +-----------------+-----------------+
                                    |
                 +------------------+------------------+
                 | (Postgres Transactions, RLS, Auth)  |
                 +-------------------------------------+
```

#### Component Boundaries (React Rendering Contexts)

##### Server Components (Read-Heavy / High-Performance Data Loading)
* `/dashboard/page.tsx`, `/transactions/page.tsx`, `/inventory/page.tsx`, `/contacts/page.tsx`, `/settings/page.tsx`.
* Direct data retrieval from Supabase. No client-side layout flashing. No exposure of DB credentials.

##### Client Components (Stateful Forms / Interactive Elements)
* Elements requiring `'use client'` tags: `<LanguageToggler />`, `<InvoiceDraftForm />` (Zustand state bindings), `<CommandSearchMenu />`, dynamic dropdown sheets (`<DropdownMenu />`), interactive navigation containers.

#### Data Integrity & Concurrency Controls
* **Isolation Level:** All invoice-to-stock database operations must be wrapped in PostgreSQL queries enforcing a transaction isolation level of `READ COMMITTED`.
* **Locking Strategy:** Implement optimistic locking using a numeric `version` column on the `PRODUCT_OR_SERVICE` schema.
* *Write Pattern:*
  ```sql
  UPDATE product_or_service 
  SET current_stock = current_stock - $1, version = version + 1 
  WHERE id = $2 AND version = $3 AND current_stock >= $1;
  ```
  If zero rows are updated, the Server Action aborts the update, rolls back, and returns `Error_Code: CONCURRENT_UPDATE_CONFLICT`.

#### Transaction Idempotency
* Every invoice creation dispatch must require a unique client-side generated UUID `idempotency_key` placed within the request metadata.
* *Conflict Handler:* If a payload matching an existing `idempotency_key` for the organization is processed, the system must skip execution and return the previously created record with HTTP status 200.

---

### 3. DEVELOPER-READY USER STORIES & AUTONOMOUS TESTING

#### Core User Stories

##### User Story 1: Language and Direction Inversion
* **As an** Arab Store Owner,
* **I want to** toggle the platform interface language from English to Arabic,
* **So that** the entire interface instantly changes layout direction from LTR to RTL and updates the text baseline.
* **Acceptance Criteria (BDD):**
  * **Given** the owner is viewing the active `/dashboard` in default LTR format (English),
  * **When** they click the primary Language Selector element in the top utility panel,
  * **Then** the UI must dynamically toggle the `html` element element attribute `dir` from `ltr` to `rtl`, swap active fonts to the Tajawal typeface, load translations from the locale dictionary, and persist this choice in the local storage cookie.

##### User Story 2: Standard Sales Invoice Generation with Stock Adjustment
* **As an** Operator,
* **I want to** build a multi-item sales invoice for an existing contact,
* **So that** inventory values automatically update and total tax computations are correctly processed.
* **Acceptance Criteria (BDD):**
  * **Given** the operator is on the dynamic `/transactions/new` interface with a draft state loaded,
  * **When** they add "Item A" (Stock count: 10, unit price: 100 SAR) and request a quantity of 3,
  * **Then** the client-side Zustand store must update the subtotal value to 300 SAR, calculate the 15% VAT (45 SAR), render the Grand Total (345 SAR), and block submission if requested amounts exceed the recorded stock limit.

##### User Story 3: Multi-Tenant Data Isolation Enforcement
* **As an** Admin of Organization Alpha,
* **I want to** verify that my private operational data cannot be accessed by other tenants,
* **So that** there is no risk of cross-tenant exposure.
* **Acceptance Criteria (BDD):**
  * **Given** a direct query is executed via the client layer using an active token belonging to Organization Beta,
  * **When** requesting data from resource table endpoints (such as `contacts` or `products`) belonging to Organization Alpha,
  * **Then** the database security layer must block the query, return zero results, and enforce isolation rules via PostgreSQL Row Level Security (RLS).

#### Testing Directives for Autonomous Agent Execution
* **Testing Stack:** Unit and integrated API test flows run through `Vitest`. System integration end-to-end user tests run through `Playwright`.
* **Isolation Constraints:** The test harness must not execute tests against production database states. 
  * *Data Factory Pattern:* Generate mock organizations, profiles, and tables using unique UUID strings generated dynamically via mock factor scripts. Wrap test databases inside automated setup/teardown execution blocks.
* **Required Commands:**
  * To trigger full test workflows, invoke: `npm run test:all`.
* **Autonomous Error Recovery Strategy:** If any test fails, the agent must inspect the terminal error traces, locate the file reference, apply the necessary code correction, and execute `npm run test:all` up to three (3) consecutive times. If issues persist after the third attempt, write a log file named `agent_debug_error.log` and await manual input.

---

### 4. API DESIGN, DATABASE & SUPABASE MCP STRATEGY

#### DDL Schema Definition (Supabase Postgres)

```sql
-- Core Setup: Enforce UUID-OSSP capabilities
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Define Roles Type Enum
CREATE TYPE profile_role AS ENUM ('ADMIN', 'EMPLOYEE');
CREATE TYPE contact_type AS ENUM ('CLIENT', 'SUPPLIER');
CREATE TYPE transaction_type AS ENUM ('SALE', 'PURCHASE');
CREATE TYPE payment_status_type AS ENUM ('PAID', 'PARTIAL', 'UNPAID');

-- 1. Organizations Table
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    tax_number VARCHAR(100) NULL,
    currency VARCHAR(10) DEFAULT 'SAR',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Profiles Table (Linked to Supabase Auth)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL UNIQUE,
    role profile_role DEFAULT 'EMPLOYEE',
    full_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Contacts Table
CREATE TABLE contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    type contact_type NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NULL,
    email VARCHAR(255) NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Products Table
CREATE TABLE products_or_services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    sku VARCHAR(100) NULL,
    sale_price NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    purchase_price NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    current_stock INTEGER NOT NULL DEFAULT 0,
    is_service BOOLEAN NOT NULL DEFAULT FALSE,
    version INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT sku_org_unique UNIQUE (organization_id, sku)
);

-- 5. Transactions Table
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE RESTRICT,
    type transaction_type NOT NULL,
    reference_number VARCHAR(100) NOT NULL,
    subtotal NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    tax_rate NUMERIC(5, 4) NOT NULL DEFAULT 0.1500, -- Static 15% VAT Standard rate (0.1500)
    total_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    payment_status payment_status_type DEFAULT 'UNPAID',
    idempotency_key UUID NOT NULL,
    transaction_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT ref_org_unique UNIQUE (organization_id, reference_number),
    CONSTRAINT idemp_org_unique UNIQUE (organization_id, idempotency_key)
);

-- 6. Transaction Items Table
CREATE TABLE transaction_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products_or_services(id) ON DELETE RESTRICT,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(15, 2) NOT NULL,
    total_price NUMERIC(15, 2) NOT NULL
);
```

#### API Interface Contracts

##### Endpoint 1: Invoice Submission Request Validation
```typescript
import { z } from 'zod';

export const CreateTransactionItemSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().positive(),
  unitPrice: z.number().nonnegative(),
});

export const CreateTransactionSchema = z.object({
  contactId: z.string().uuid(),
  type: z.enum(['SALE', 'PURCHASE']),
  referenceNumber: z.string().min(1).max(100),
  taxRate: z.literal(0.15), // Static 15% VAT MVP limit
  idempotencyKey: z.string().uuid(),
  items: z.array(CreateTransactionItemSchema).nonempty(),
});

export type CreateTransactionInput = z.infer<typeof CreateTransactionSchema>;
```

##### Endpoint 2: Product Creation Validation
```typescript
export const CreateProductSchema = z.object({
  name: z.string().min(2).max(255),
  sku: z.string().min(1).max(100).optional(),
  salePrice: z.number().nonnegative(),
  purchasePrice: z.number().nonnegative(),
  currentStock: z.number().int().nonnegative().default(0),
  isService: z.boolean().default(false),
});

export type CreateProductInput = z.infer<typeof CreateProductSchema>;
```

##### Endpoint 3: Contact Record Validation
```typescript
export const CreateContactSchema = z.object({
  type: z.enum(['CLIENT', 'SUPPLIER']),
  name: z.string().min(2).max(255),
  phone: z.string().max(50).optional(),
  email: z.string().email().optional().or(z.literal('')),
});

export type CreateContactInput = z.infer<typeof CreateContactSchema>;
```

#### Authentication & RBAC Rules
Authentication verification uses dynamic tokens returned from Supabase Auth (`auth.uid()`). Authenticated context payloads are mapped to tenant scopes using the database RBAC matrix.

| Destination Node | HTTP / Action Verb | Admin Context Permission | Employee Context Permission |
| :--- | :--- | :--- | :--- |
| `/api/transactions` | GET / POST | Allowed (Self-tenant only) | Allowed (Self-tenant only) |
| `/api/products` | GET / POST / PUT | Allowed (Self-tenant only) | Allowed (Self-tenant only) |
| `/api/products/[id]` | DELETE | Allowed (Self-tenant only) | Denied (Error: HTTP 403 Forbidden) |
| `/api/settings` | POST / PUT | Allowed (Self-tenant only) | Denied (Error: HTTP 403 Forbidden) |

#### Standardized Error Payloads
Whenever the system fails validation, catches database constraints, or matches access violations, it must return standard error payloads using this pattern:

```json
{
  "success": false,
  "code": "ERROR_CODE_STRING",
  "message": "Localized error message detailing failure",
  "errors": []
}
```

##### Code Resolution Map

| Error Scenario | HTTP Code | Schema `code` Key |
| :--- | :--- | :--- |
| Input fields failed Zod evaluation | 400 | `VALIDATION_FAILED` |
| Security token missing/expired | 401 | `UNAUTHORIZED` |
| Database constraint/access failure | 403 | `FORBIDDEN` |
| Key concurrency/Optimistic lock mismatch | 409 | `CONCURRENT_UPDATE_CONFLICT` |
| Attempted creation on empty database keys | 422 | `INSUFFICIENT_STOCK` |

#### Database Migration Pipeline via Supabase MCP
The autonomous coding agent must run the migration pipeline directly without manual operations.

##### Migration Directives
1. Define all entity structures inside the local project scope within static SQL script files inside `/supabase/migrations/` using chronological file prefixing conventions (e.g., `20260602000000_init.sql`).
2. Write matching `Down` procedures inside a dynamic script block or fallback catalog setup.
3. To apply these configurations, run migrations programmatically through the Supabase Model Context Protocol (MCP) using the target system command `execute_sql`.
4. Ensure every created table has Row Level Security (RLS) enabled.
5. Create default RLS policies targeting the dynamic mapping query.
   * *Example:*
     ```sql
     ALTER TABLE products_or_services ENABLE ROW LEVEL SECURITY;
     
     CREATE POLICY tenant_isolation_policy ON products_or_services
       FOR ALL
       USING (organization_id = (
         SELECT organization_id FROM profiles WHERE id = auth.uid()
       ));
     ```

---

### 5. UI/UX

#### Agent Directives for UI Execution
* Style the interface layout elements exclusively with Utility Class systems provided by Tailwind CSS, combined with pre-packaged interactive UI templates from Shadcn UI.
* Do not customize design layouts outside the central standard variables configuration defined inside `tailwind.config.js`.

#### State Handling Implementation Specifications

```
             +-----------------------------------------+
             |            Inventory Route              |
             +--------------------+--------------------+
                                  |
            +---------------------+---------------------+
            |                                           |
    [Loading State]                                [Data Loaded]
  - Skeletons rendering                    - Render high-density tables
  - Layout structures static               - Highlight search results
                                                        |
                                            +-----------+-----------+
                                            |                       |
                                      [Empty State]           [Error State]
                                     - Icon + dynamic CTA    - Display boundary alert
                                     - Primary action        - Reset controls
```

##### 1. Loading States
* When loading inventory lists or transactions, render an active placeholder layout matching the shape of the table.
* Implement structured dynamic component skeleton overlays:
  ```typescript
  import { Skeleton } from "@/components/ui/skeleton";
  
  export function TableRowSkeleton() {
    return (
      <div className="flex items-center space-x-4 py-2">
        <Skeleton className="h-4 w-[250px]" />
        <Skeleton className="h-4 w-[200px]" />
        <Skeleton className="h-4 w-[100px]" />
      </div>
    );
  }
  ```

##### 2. Empty States
* Render an empty state view whenever lists or search results contain zero items.
* Ensure empty states feature:
  * A clear visual asset (e.g., `<InboxIcon className="text-slate-400" />`).
  * A heading and secondary message describing how to resolve the empty state.
  * A main action button pointing to creation workflows (e.g., "+ Add New Product").

##### 3. Error States
* Use error boundaries at page-level limits.
* Display standard toast interfaces when asynchronous processes fail:
  ```typescript
  toast({
    variant: "destructive",
    title: "خطأ في معالجة الطلب / Operations Error",
    description: "تجاوزت الكمية المطلوبة المخزون المتوفر / The requested quantity exceeds available stock levels.",
  });
  ```

---

### 6. NON-FUNCTIONAL REQUIREMENTS & VERCEL MCP

#### Performance & Security Metrics
* **Endpoint Latency Target:** Core API endpoints processing writes must resolve in <200ms when tested against Vercel edge runtime nodes.
* **XSS Protection:** Enforce HTML entity sanitization on all raw user inputs before saving them to the database.
* **CORS Restrictions:** Configure strict production API access controls to permit connections only from defined client environments and dynamic Vercel staging endpoints. Do not use wildcards (`*`).

#### Environment Management
The system configuration must include a standard `.env.example` file that lists the necessary system environment parameters:

```ini
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
RESEND_API_KEY=re_your_api_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

#### Observability & Logs
* Implement unified server-side structured JSON logging outputs:
  ```json
  {"timestamp":"2026-06-02T15:20:00Z","level":"INFO","tenant":"uuid-org-id","event":"INVOICE_CREATED","metadata":{"amount":345.00}}
  ```
* Do not expose authentication signatures or plaintext PII strings within stdout log streams.

#### Project Directory Tree Structure (Feature-Based)

```
├── .env.example
├── package.json
├── playwright.config.ts
├── vitest.config.ts
├── supabase
│   ├── migrations
│   │   ├── 20260602000000_init.sql
│   │   └── 20260602000001_rls_policies.sql
├── src
│   ├── app
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── auth
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   └── [lang]
│   │       ├── layout.tsx
│   │       ├── dashboard/page.tsx
│   │       ├── inventory/page.tsx
│   │       └── transactions
│   │           ├── page.tsx
│   │           ├── new/page.tsx
│   │           └── [id]/page.tsx
│   ├── components
│   │   └── ui (Shadcn atomic imports)
│   ├── features
│   │   ├── auth (Auth components, actions, types)
│   │   ├── transactions (Invoice forms, calculating functions)
│   │   ├── inventory (Item tables, adjustment states)
│   │   └── contacts (Directory UI components)
│   ├── lib
│   │   ├── supabase.ts (Client wrappers)
│   │   └── utils.ts
│   └── store
│       └── useInvoiceStore.ts (State slice container)
```

##### Codebase Style Conventions
* **React Nodes:** PascalCase formatting (e.g., `<InvoiceDraftForm />`).
* **Directories & Dynamic Routing:** Lowercase kebab-case naming structures (e.g., `/transactions/new`).
* **System Utilities / Actions:** camelCase formatting (e.g., `calculateVAT()`).

#### Vercel Deployment & Secret Sync Workflow (Autonomous Agent Rules)
* Connect the application configuration using the Vercel MCP link functions.
* Parse env parameters from the local configuration or Supabase instance, and inject those keys into the Vercel platform environment using the Vercel MCP. 
* Do not store API credentials, security tokens, or service key patterns within plaintext configuration files inside the codebase.

---

### 7. AGENT EXECUTION PLAN (STEP-BY-STEP)

```
 +------------------+     +------------------+     +------------------+     +------------------+
 |  1. Project Init | --> | 2. DB Migrations | --> |  3. Backend Core | --> | 4. Stateful Store|
 +------------------+     +------------------+     +------------------+     +------------------+
                                                                                      |
 +------------------+     +------------------+     +------------------+               |
 | 7. Live Deploy   | <-- | 6. Integration   | <-- |   5. UI Pages    | <-------------+
 |    & Verification|     |    & E2E Tests   |     |    (Shadcn RTL)  |
 +------------------+     +------------------+     +------------------+
```

The autonomous coding agent must follow this step-by-step plan:

* **Step 1: Project Initialization & Configuration Setup**
  * Initialize the Next.js App Router workspace with Tailwind CSS and Shadcn.
  * Define configuration scripts, setup testing packages (Vitest and Playwright), and generate the `.env.example` file.
* **Step 2: Database Migration Deployment (Supabase MCP)**
  * Run SQL migration files containing structural declarations via the Supabase MCP `execute_sql` tool.
  * Enable Row Level Security (RLS) on all tables and apply RBAC isolation rules.
* **Step 3: Core API Routing & Server Actions Implementation**
  * Build schema validators with Zod.
  * Implement Server Actions for core resources: Auth, Products, Contacts, and Transactions. Include database transaction handling and concurrency controls.
* **Step 4: State Management Store Configuration**
  * Implement the Zustand state store (`useInvoiceStore`) to handle invoice draft items, quantities, tax calculations, and validation checks.
* **Step 5: Frontend Views Integration (RTL-First Layouts)**
  * Build the user interface with RTL layout support. Use Shadcn components for tabular displays, sliding drawers, and input controls.
  * Apply directional Tailwind utility classes (`ps-*`, `pe-*`, `start-*`, `end-*`) to handle LTR/RTL dynamic switches.
* **Step 6: Integration & End-to-End Automated Testing**
  * Run unit and system integration test pipelines: `npm run test:all`.
  * Use the autonomous debug loop to intercept, fix, and verify test failures before proceeding.
* **Step 7: Production Cloud Deployment (Vercel MCP)**
  * Connect and register the workspace with the hosting platform via Vercel MCP tools.
  * Copy keys from the database service profile and inject them as environment variables.
  * Run the build process and verify active deployment links.

---

### 8. EXPLICIT ASSUMPTIONS

* **VAT Calculation:** Taxes are calculated using a static 15% rate (standard VAT in Saudi Arabia/KSA). Changing the tax rate requires updating the system settings panel, which is restricted to admin profiles.
* **Auth Lifecycle Hook:** Supabase Auth is configured to automatically create a corresponding `profiles` record inside public schemas whenever a user registers.
* **Network Stability Assumptions:** PWA service workers cache static application assets for offline access, but the creation of transactions and update of inventory levels require an active internet connection to resolve edge server actions. No offline database syncing is supported for transaction writes in the MVP.