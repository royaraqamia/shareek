# Developer Documentation Template

A production-ready full-stack developer template for building secure, high-performance Next.js 15+ applications integrated with server-side Gemini AI models.

## Tech Stack

Here is the core technical architecture of our application:

*   **Frontend Framework:** React 19 (Server Components by default, Client Components for interactivity) and Next.js 15 (App Router with stand-alone output configuration).
*   **Styling & UI:** Tailwind CSS v4 (configured via PostCSS plugin `@tailwindcss/postcss`), custom component utilities with `clsx` and `tailwind-merge`, and unified vector iconography using `lucide-react`.
*   **Animations:** Declarative motion orchestrations powered by `motion` (imported from `motion/react`).
*   **API & Integration:** Official `@google/genai` SDK (version `^2.4.0`) for server-side Gemini model automation and interactive chat workflows.
*   **Database & Tooling:** Persistent cloud hosting ready, supporting Firebase Authentication and Firestore schemas via `firebase-tools`.
*   **Linting & Verification:** ESLint and standard configurations for TypeScript strict build type-safety.

## Key Features (MVP)

The template enforces modular, high-quality architectural patterns based on strict user-story requirements:

*   🔒 **Secure Server-Side AI Operations**: All Gemini API calls are strictly encapsulated in Next.js Server Actions or server-side API Routes (`/app/api/gemini/generate/route.ts`). This ensures the `GEMINI_API_KEY` is never exposed to the client-side browser runtime.
*   ⚡ **Fluid, Interactive UI Transitions**: Leverages `motion` for staggered entrance transitions, path tracing, and micro-animations to offer a refined, cohesive feel.
*   📱 **Responsive-First Design**: Optimized layouts for mobile, tablet, and desktop environments featuring minimum touch targets of `44px` on mobile, structured grids, and standard layout containers.
*   🏗️ **Strict Type-Safe Systems**: Complete TypeScript implementations (enforcing standard `enum` definitions, strict type checks, and zero implicit type omissions).

## Local Development / Getting Started

Follow these steps to run the application in a local container or native development environment.

### Prerequisites

Ensure you have [Node.js](https://nodejs.org/) (v18.x or v20.x recommended) and `npm` installed.

### Installation & Run Steps

1.  **Clone and Navigate to the Repository**
    ```bash
    git clone <your-repository-url>
    cd <repository-directory>
    ```

2.  **Install Dependencies**
    Ensure all third-party dependencies and build libraries are fully settled:
    ```bash
    npm install
    ```

3.  **Configure Environment Variables**
    Instantiate your local environment variable configuration:
    ```bash
    cp .env.example .env
    ```
    *See the [Environment Variables](#environment-variables) section below for required configurations.*

4.  **Execute the Development Server**
    Run the application on the local port (port `3000` is the default and mandatory port for public proxy routing):
    ```bash
    npm run dev
    ```

5.  **Build for Production**
    Compile and verify a standalone production-ready bundle:
    ```bash
    npm run build
    ```

## Environment Variables

The application utilizes strict access controls for API key storage. Copy `.env.example` to `.env` and fill in the values:

| Variable Name | Accessibility | Description | Example Value |
| :--- | :--- | :--- | :--- |
| `GEMINI_API_KEY` | **Server-Only (Private)** | Required. Crucial key used to authorize interactions with Google Gemini models. Must **never** be prefixed with `NEXT_PUBLIC_`. | `AIzaSyD...` |
| `APP_URL` | **Public/Client Configuration** | Recommended. Set to the root URL where the application is deployed. Used for base redirects and relative callback resolves. | `https://your-domain.com` |

> ⚠️ **Security Warning:** Never write custom frontend input forms, UI frames, or state models that accept or store API keys in the client-side React component tree.

## Project Structure

A high-level layout of the directories and primary file placement conventions:

```tree
.
├── app/
│   ├── api/                 # Secure server-side routes (e.g., Gemini API Proxies)
│   ├── globals.css          # Global Tailwind CSS directives
│   ├── layout.tsx           # Standard application wrapper and root layout
│   └── page.tsx             # Interactive dashboard and core page assembly
├── assets/                  # Public visual resources and static assets
├── components/              # Modular, reusable client/server React components
├── hooks/
│   └── use-mobile.ts        # Client responsiveness hook
├── lib/
│   └── utils.ts             # Tailwind class merging utility logic
├── docs/                    # Architectural templates and design guidelines
├── .env.example             # Sample configuration options
├── metadata.json            # Deployment configuration and frame permissions
├── next.config.ts           # Standalone compilation and image host registrations
└── tsconfig.json            # Rigorous TypeScript ruleset configuration
```
