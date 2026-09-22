# 🎙️ AI Interview Service Rules (`apps/ai-interview` - GEMINI.md)

- Stream 16-bit PCM binary audio over WebSockets.
- Implement low-latency VAD with immediate barge-in / interruption cancellation.
- Score candidates across 4 dimensions: Technical Depth, Communication, Pedagogy, Problem Solving.
- Sync turns & results to `apps/http` via `/api/internal/interviews/*` with `x-internal-secret`.
- Follow [ai-interview-realtime](file:///d:/second-project/coursity-rebuild/.agents/skills/ai-interview-realtime/SKILL.md).
