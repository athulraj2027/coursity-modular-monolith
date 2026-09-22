---
name: ai-interview-realtime
description: >-
  Use this skill when working on the real-time AI voice interview engine in apps/ai-interview,
  including WebSocket audio streaming, VAD turn detection, LangGraph conversation state machines,
  speech-to-text / text-to-speech pipelines, and inter-service synchronization with apps/http.
---

# AI Interview Real-Time Engine Skill (`apps/ai-interview`)

This skill defines the technical workflow and protocols for the **Coursity AI Interview Microservice** (`apps/ai-interview`).

---

## 🏛️ Real-Time Interaction Pipeline

```mermaid
sequenceDiagram
    autonumber
    actor Candidate as Candidate (Browser)
    participant WS as AI WebSocket Server (:4000)
    participant STT as Speech-to-Text (Deepgram)
    participant Graph as LangGraph Conversation Engine
    participant TTS as Text-to-Speech (ElevenLabs)
    participant S3 as AWS S3 Storage
    participant CoreAPI as Core HTTP API (:3000)

    Candidate->>WS: Connect with JWT & Session Token
    WS->>Candidate: Handshake OK + Ready Event
    loop Conversation Turns
        Candidate->>WS: Binary 16-bit PCM Audio Chunks
        WS->>STT: Stream Audio for VAD & Transcription
        STT-->>WS: Final Transcribed Candidate Text
        WS->>Graph: Execute Turn State Machine
        Graph-->>WS: Next Question / Follow-up / Evaluation
        WS->>TTS: Stream Question Text
        TTS-->>WS: Binary Audio Chunks
        WS->>Candidate: Stream Audio Chunks to Speaker
        WS->>CoreAPI: Sync Turn Text & Session State (/internal/interviews/turns)
    end
    WS->>S3: Upload Full Session Audio Recording (.wav)
    WS->>CoreAPI: Submit Final Multi-Rubric Evaluation & S3 URL
```

---

## 🔄 Conversation State Machine & Rubrics

The interview flow is orchestrated as a state graph with strict evaluation boundaries:

```
[INIT / GREETING]
       │
       ▼
[ASSESS_BACKGROUND] ── (Clarify candidate experience & domains)
       │
       ▼
[TECHNICAL_QUESTIONS] ── (Core domain deep dives & scenario problems)
       │
       ▼
[PROBE_FOLLOW_UPS] ── (Evaluate edge cases, trade-offs & architecture)
       │
       ▼
[RUBRIC_SCORING] ── (Generate scores across 4 evaluation dimensions)
       │
       ▼
[CONCLUDE_SESSION] ── (Archive audio to S3, finalize report in apps/http)
```

### 4-Dimensional Evaluation Rubric
1. **Technical Depth (0-100)**: Accuracy of concepts, understanding of underlying runtime, systems design.
2. **Communication (0-100)**: Clarity, conciseness, structured thinking, and responsiveness.
3. **Pedagogical Ability (0-100)**: Ability to explain complex topics simply, empathy, and mentoring aptitude.
4. **Problem Solving (0-100)**: Methodical troubleshooting, trade-off analysis, and adaptability.

---

## 🔐 Inter-Service Security & Syncing Protocol

The AI Interview server communicates with `apps/http` using signed internal requests:
* **Header**: `x-internal-secret: <INTERNAL_SERVICE_SECRET>`
* **Endpoints**:
  * `POST /api/internal/interviews/sessions/start`
  * `POST /api/internal/interviews/turns`
  * `POST /api/internal/interviews/sessions/complete`
