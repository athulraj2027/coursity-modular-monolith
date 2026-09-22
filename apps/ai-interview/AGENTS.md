# 🎙️ AI Interview Service Rules (`apps/ai-interview`)

Guidelines and constraints for the **Coursity Real-Time AI Voice Interview Engine**.

---

## ⚡ Real-Time Audio & Microservice Invariants

1. **Audio Streaming**:
   - Audio must be 16-bit linear PCM (sampled at 16kHz or 24kHz).
   - Voice Activity Detection (VAD) must handle user interruptions immediately by sending a cancel/stop playback frame to the client.
2. **State Machine Transitions**:
   - Conversation graph transitions must follow: `Greeting` ➔ `Background Assessment` ➔ `Technical Deep Dive` ➔ `Follow-up Probing` ➔ `Multi-Rubric Evaluation`.
3. **Multi-Rubric Scoring**:
   - Scores must be computed across 4 dimensions: *Technical Depth*, *Communication*, *Pedagogy*, and *Problem Solving* (0-100 scale).
4. **Backend Synchronization**:
   - Every state change and turn must be signed with `x-internal-secret` and synced to `apps/http` via `/api/internal/interviews/*`.
5. **Session Archiving**:
   - Upload full audio session WAV files directly to AWS S3 upon session completion.

---

## 📚 Related Skill
* Activate the [ai-interview-realtime](file:///d:/second-project/coursity-rebuild/.agents/skills/ai-interview-realtime/SKILL.md) skill for the full sequence diagram and state graph details.
