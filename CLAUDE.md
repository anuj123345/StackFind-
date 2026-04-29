# StackFind Development Guide

## Build & Test
- `npm run dev`: Start development server
- `npx tsc --noEmit`: Verify type safety (critical before deployment)
- `npm run build`: Production build

## Database Types (CRITICAL)
- **Pattern**: We use a manual, flat interface structure in `src/types/database.ts`.
- **Reason**: The standard Supabase CLI generation causes circularity/depth issues in this project.
- **Rule**: DO NOT overwrite `src/types/database.ts` using `supabase gen types`.
- **Maintenance**: When modifying migrations, manually update the corresponding `Row`, `Insert`, and `Update` entries in `src/types/database.ts`.

## UI & Design
- **Theme**: Light only (Warm parchment `#FAF7F2`).
- **Fonts**: Bricolage Grotesque (Display), Onest (Body).
- **Icons**: Lucide React.
- **Transitions**: Use Framer Motion for smooth entrances.

## Recent Updates (2026-04-29)
- **DeepSeek & Playground Usage Fixes**: Fixed `incrementPlaygroundUsage` failing to upsert missing user profiles (which prevented the usage limit from triggering). Adjusted the DeepSeek model integration to correctly treat `deepseek-v3.2` as a standard model instead of a reasoning model.
- **Playground Fixes**: Stabilized AI generation stream with a retry option, restored Managed Billing link redirection, and cleaned up export options (retaining only Email).
- **Managed Billing & Razorpay**: Implemented a full checkout flow for Indian founders. Integrated Razorpay for INR payments with automated convenience fee (5%) and GST (18%) calculations.
- **Cinematic Welcome**: Added 'Assembly of Light' welcome intro (`welcome-intro.tsx`) with particle animations andlogo reveal. Persistence via `sessionStorage`.
- **AI Playground reasoning**: Integrated Kimi K2.5 reasoning mode via NVIDIA NIM. Added heartbeat signals to prevent gateway timeouts.
- **Admin Command Center**: Complete redesign of `admin-dashboard.tsx` with glassmorphic, holographic stats and real-time activity streams.

## Key Features & Current State
- **Playground**: Supports Anthropic (Claude 3.5 Haiku) and NVIDIA NIM (Meta Llama 3.3, Kimi K2.5). Streaming enabled.
- **Billing**: Managed billing requests handled via Supabase `billing_requests` table. Payment gateway live for managed stacks.
- **Auth**: Supabase Auth with custom `profiles` table.
- **Admin**: Accessible via `x-admin-key` header logic.
- **Theme**: Warm parchment theme (`#FAF7F2`) with premium Antigravity design principles (glassmorphism, micro-animations).

## Handover Context
- **Deployment**: Next.js 15 (Breaking APIs). Always run `npx tsc --noEmit` before push.
- **Database**: Strictly follow `src/types/database.ts` manual updates.
- **API Keys**: Ensure `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `NVIDIA_API_KEY`, and `ANTHROPIC_API_KEY` are present in `.env.local`.
