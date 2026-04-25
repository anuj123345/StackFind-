# StackFind: The Managed Stack for Indian Founders

StackFind is a premium platform designed to help Indian founders discover, build, and bill their SaaS stacks in INR. It solves the "USD Billing" friction by providing a managed billing layer.

## Core Features
- **AI Playground**: Build your product plan using high-reasoning models (Claude 3.5, Llama 3.3, Kimi K2.5).
- **Managed Billing**: Pay for global SaaS tools in INR via UPI/Netbanking with automated GST invoicing.
- **Founders' Directory**: A curated list of essential tools with detailed pricing and India-specific support info.
- **Cinematic Experience**: High-fidelity, glassmorphic UI with animated transitions and immersive introductions.

## Tech Stack
- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS + Framer Motion + Glassmorphism
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **Payments**: Razorpay Integration (managed billing flow)
- **AI**: Anthropic SDK & NVIDIA NIM (Streaming enabled)

## Development

```bash
npm install
npm run dev
```

### Critical Rules
- Always verify types with `npx tsc --noEmit`.
- Maintain manual database types in `src/types/database.ts`.
- Follow the warm parchment theme (`#FAF7F2`) and Antigravity design principles.

## Deployment
Deployed on Vercel. Ensure all environment variables (Razorpay, Supabase, Anthropic, NVIDIA) are configured in the Vercel dashboard.
