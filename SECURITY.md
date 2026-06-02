# Security Policy

We take the security of our developer templates, applications, and integrations extremely seriously. Please read the following guidelines to understand our supported releases, reporting protocols, and internal security safeguards.

## Supported Versions

Only the latest major releases receive security configurations, patches, and routine audits:

| Version | Supported | Notes |
| :--- | :--- | :--- |
| **v1.x.x** |  Active Support | Current production release branch receiving active vulnerability patches and compliance updates. |
| < v1.0.0 | ❌ No | Pre-release and legacy builds. Users are strongly encouraged to upgrade. |

## Reporting a Vulnerability

> 🚨 **Crucial Directive:** Please **do not** open public GitHub issues, forum topics, or public pull requests for potential security flaws. Publicly disclosing a security bug makes the vulnerability immediately accessible to malicious actors.

If you discover a security vulnerability, please report it privately through the following protocol:

1.  **Draft a Private Report**: Include a clear description of the issue, system logs, code snippets, or a minimal proof of concept (PoC) illustrating the exploit vector.
2.  **Submit Confidential Report**: Email your completed report directly to:
    ```
    [Insert Security Email Here]
    ```
3.  **Acknowledge and Resolve**:
    *   Our security maintainers will acknowledge receipt of your email within **48 hours**.
    *   We will coordinate a security audit, develop a patch, and draft an advisory.
    *   Once fully patched, we will publish the advisory and credit you for the responsible disclosure.

---

## Internal Security Posture

To protect user details, secure our APIs, and prevent data leakage, the codebase adheres strictly to the following architectural constraints:

### 1. Strict Server/Client Component Boundaries
We maintain an absolute separation of secrets and UI presentation logic:
*   **Zero Leakage**: All computational AI features using `@google/genai` run strictly server-side inside `app/api/*` routes or Next.js Server Actions.
*   **Separation of Concerns**: Only stateless layout renderers and event-listening UI components (marked with the `'use client'` directive) execute in the browser runtime. Data models or remote queries are NEVER directly loaded in Client Components to prevent client-side credential exposure.

### 2. Mandatory Row Level Security (RLS) on Databases
Our databases (e.g., Cloud Firestore, PostgreSQL, Supabase) are locked down by default:
*   **Enterprise Isolation**: Strict Row Level Security (RLS) is configured ensuring that read/write permissions are authorized on a per-user basis.
*   **No Wildcards**: Public read or write access is completely blocked (`allow read, write: if false;` defaults). Authenticated users can only operate on records that match their exact, verified token identifier (`request.auth.uid`).

### 3. Encapsulated API Key Management
*   **No Client Prefixes**: High-security API credentials such as `GEMINI_API_KEY` are kept exclusively server-side. They are never exported or prefixed with public identifiers such as `NEXT_PUBLIC_`.
*   **Lazy Initialization & Safe-Guards**: SDK client bindings are verified and instantiated lazily upon actual function invocation. If a required private key is missing from the environment variables, the codebase handles the exception gracefully instead of crashing on container startup.

### 4. CORS Configurations & Robust Payload Validation
To mitigate Cross-Site Scripting (XSS), Cross-Site Request Forgery (CSRF), and injection attempts:
*   **Payload Sanitation**: All incoming requests to Next.js API Routes must be rigorously validated using strongly typed schema-parsers (such as **Zod** or strict TypeScript validation helpers) to reject malformed or excessive payloads before execution.
*   **Safe Origins**: Cross-Origin Resource Sharing (CORS) is locked down, allowing requests only from trusted host domains specified in the primary server environment variables.
