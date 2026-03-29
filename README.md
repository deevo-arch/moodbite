# 🍷 MoodBite: The Culinary Noir Experience

> **"The Digital Sommelier for the Modern Epicurean."**

MoodBite is a high-end, social-first culinary platform that redefines food discovery through the lens of human emotion. Instead of generic lists, MoodBite curates its entire experience based on the user's "Vibe"—from the comfort of a rainy night to the electric energy of a celebration.

---

## 🌓 The Philosophy: Culinary Noir
MoodBite rejects the "flat web" aesthetic of traditional delivery apps. Inspired by **The Nocturnal Epicurean** design system, the platform utilizes:
- **Glassmorphism**: Translucent, frosted surfaces that create depth and immersion.
- **Editorial Typography**: High-contrast, bold headings that feel like a premium culinary magazine.
- **Vibrant Accents**: A signature palette of `Culinary Orange` and `Midnight Blue` against a deep black void.
- **Asymmetrical Layouts**: Break the grid with oversized, high-resolution food photography that bleeds into the UI.

---

## 🛠️ Tech Stack: The Engine Room
MoodBite is built on a state-of-the-art stack designed for speed, security, and elegance:

- **Framework**: [Next.js 15+](https://nextjs.org/) (App Router) for hybrid rendering and optimized performance.
- **Logic**: [React 19](https://react.dev/) with Server Components and [Concurrent Mode](https://react.dev/blog/2024/12/05/react-19).
- **Styling**: Vanilla CSS + [Tailwind CSS](https://tailwindcss.com/) for precision glassmorphism and responsive bento-grids.
- **Database**: [Prisma ORM](https://www.prisma.io/) with an efficient **SQLite** engine (can be easily scaled to PostgreSQL).
- **Authentication**: Multi-provider system supporting **Google**, **Discord**, and **Secure Credentials**.
- **Real-time**: Leverages **SSE (Server-Sent Events)** for live order tracking across User, Restaurant, and Admin dashboards.
- **Animations**: [Framer Motion](https://www.framer.com/motion/) for fluid transitions and micro-interactions.

---

## 🗺️ System Architecture & Workflows

### 1. The Vibe Selector (User Journey)
Users don't just "search" for food; they select a mood.
- **Logic**: The platform filters the restaurant universe through "Vibe Tags" (e.g., *Comfort*, *Energetic*, *Romantic*).
- **Experience**: A horizontal "Vibe Carousel" triggers a layout transition, surfacing only the most relevant culinary partners.

### 2. Kitchen Command (Restaurant Dashboard)
A mission-control interface for culinary partners.
- **Menu Management**: Integrated CRUD system with real-time menu toggles.
- **Order Lifecycle**: Restaurants manage orders through stages: `PENDING` → `PREPARING` → `READY_FOR_PICKUP`.
- **SSE Integration**: Orders appear instantly without page refreshes.

### 3. The Control Center (Admin Dashboard)
The "MoodMin" portal for platform oversight.
- **Bento Stats**: High-level analytics on revenue, order velocity, and mood distribution.
- **Verification Engine**: Secure workflow for onboarding new restaurants and delivery partners.
- **User Directory**: Global management of all platform participants.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18.x or higher
- npm or yarn

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/moodbite.git
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up your environment:
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL="file:./dev.db"
   NEXTAUTH_SECRET="your-secret-here"
   # Add your Google/Discord OAuth credentials
   ```

### Database Initialization
> [!NOTE]
> The repository includes a pre-seeded `prisma/dev.db`, so you can start the application immediately without running seeding commands.

1. Generate the Prisma client:
   ```bash
   npx prisma generate
   ```
2. Push the schema to your local DB:
   ```bash
   npx prisma db push
   ```
3. Seed the database (Creates Admin, Test Users, and Restaurants):
   ```bash
   npx prisma db seed
   ```

---

## 🧪 Seeding & Test Accounts
The `prisma/seed.ts` script populates the database with a high-end test suite. 
- **SuperAdmin**: `akashmishrap@icloud.com`
- **Restaurants**: Various themed culinary partners (e.g., "The Comfort Kitchen").
- **Users**: Standard customer profiles with predefined order histories.

---

## 🎨 Credits
- **Design System**: Created via **Stitch MCP** ("The Nocturnal Epicurean").
- **Backgrounds**: Custom Vanta.js integration for the atmospheric hero section.
- **Developed By**: Akash & Antigravity AI.

---
*© 2026 MoodBite. Crafted with precision for the next generation of food lovers.*
