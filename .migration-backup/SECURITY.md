# Security Policy

We take the security, integrity, and data privacy of Shareek ERP very seriously. As an ERP system managing commercial transaction records, tenant boundaries, and inventory stock balances, establishing a robust security posture is a core architectural priority.

---

## 🎯 Supported Versions

Active security updates and vulnerability patches are directed exclusively to the following branch releases:

| Version | Supported | Notes |
| :--- | :--- | :--- |
| **`v1.x.x`** | ✅ Yes | Current active MVP release (Next.js 15+ App Router / Supabase). |
| `< v1.0.0` | ❌ No | Experimental alpha versions and local testing iterations. |

---

## 📬 Reporting a Vulnerability

**Please do not open public GitHub issues or forum threads for security vulnerabilities.** Publicly disclosing a flaw before it is patched exposes companies and tenant databases to malicious actions.

To report a vulnerability:
1. Contact our security response coordinator directly via email at `i.ayhamalali@gmail.com`.
2. Provide a detailed summary of the vulnerability, including a proof-of-concept (PoC), steps to reproduce, or sample request payloads where applicable.
3. You will receive an initial response confirming receipt of your report within **48 hours**. 
4. We will coordinate a fix and publish an update as quickly as possible, usually within 7-14 business days, maintaining transparency with you throughout the remediation process.

---

## 🛡 Internal Security Posture

Our developer and deployment policies enforce a strict multi-layered security configuration as requested by the product engineering specifications.

### 1. Server vs. Client Components Boundary Rules
- **Server Components (RSCs) by Default:** All page routes (e.g. `/dashboard`, `/transactions`, `/inventory`) are implemented as React Server Components. They read directly from the database from secure, protected environment layers. This completely eliminates the risk of exposing database connection details or privileged service handles to browser environments.
- **Client Components ('use client') Isolation:** Client components are pushed to the leaf nodes of our rendering tree. They serve exclusively to facilitate user interactivity (e.g. stateful invoice drawers, modal triggers, search inputs). They communicate with backend layers solely via safe, serialized parameters handled by Server Actions or isolated server API routes.

### 2. Multi-Tenant Row Level Security (RLS)
- Every relational table managed within our Supabase database (including `contacts`, `products_or_services`, `transactions`, and `transaction_items`) is strictly governed by **Row Level Security (RLS)**.
- RLS policies assertion verifies that the user’s certified active session token (`auth.uid()`) maps onto an approved structure in the `profiles` table.
- Direct queries crossing tenant scopes are immediately blocked at the database engine level, returning zero records and ensuring that Organization Alpha and Organization Beta are fully insulated from each other:
  ```sql
  ALTER TABLE products_or_services ENABLE ROW LEVEL SECURITY;
  
  CREATE POLICY tenant_isolation_policy ON products_or_services
    FOR ALL
    USING (organization_id = (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    ));
  ```

### 3. API Key & Secret Management
- Plaintext credentials, passwords, cryptographic keys, and Supabase service keys are **never** committed to public repository branches.
- Production environment configurations are managed through isolated, zero-trust secrets stores on the Vercel hosting platform.
- Public/private key segmentation ensures any endpoint parameter prefixed with `NEXT_PUBLIC_` is public-safe, whereas deep server secrets like service roles are withheld exclusively in node sandbox parameters.

### 4. Input Sanitization & Payload Validation
All structural actions and mutations execute validation checks prior to database insertion:
- Rigorous parsing utilizes **Zod Schemas** (`CreateTransactionSchema`, `CreateProductSchema`, `CreateContactSchema`) to prune unapproved attributes, enforce expected numeric ranges, and sanitize incoming parameters against Cross-Site Scripting (XSS) or SQL Injection.
- Operations that mutate stock limits are wrapped inside atomic SQL transactions (`READ COMMITTED` isolation level) using optimistic numeric versioning to prevent double-spending, race conditions, and out-of-order writes.
