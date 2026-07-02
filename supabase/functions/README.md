# Supabase Edge Functions

## Purpose
This folder contains the source code for Supabase Edge Functions (built on Deno). Edge Functions run globally close to the user, providing low-latency serverless compute.

## Future Responsibilities
Edge functions will eventually replace heavy Node.js routes for scenarios requiring high performance, strict external webhooks, or AI workloads. 

### Placeholder Directories
- **`notifications/`**: Push notifications, email dispatch via ZeptoMail, and WhatsApp Broadcast logic.
- **`leaderboard/`**: High-performance, edge-cached serving of the Gamification Leaderboard to prevent DB strain.
- **`ai/`**: Integration with OpenAI/Whisper for transcribing Minutes of Meeting (MOMs).
- **`webhooks/`**: Fast, secure endpoints for Razorpay payment validations and Clerk auth syncs.
- **`auth/`**: Custom hooks for modifying JWT claims or validating external identity providers.

*Note: Functions are written in TypeScript and executed via the Supabase CLI (`supabase functions serve`).*
