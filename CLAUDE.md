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
