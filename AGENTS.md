<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

## Project Guardrails
- **Manual Database Types**: Always maintain the flat interfaces in `src/types/database.ts`.
- **Admin Security**: Use the `x-admin-key` header for admin routes.
- **Billing Transparency**: All INR costs must show the 5% Fee + 18% GST breakdown.
<!-- END:nextjs-agent-rules -->
