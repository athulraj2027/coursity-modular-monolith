import dotenv from "dotenv";
dotenv.config();

export const env = {
  PORT: Number(process.env.PORT || 4000),
  NODE_ENV: process.env.NODE_ENV || "development",

  // Core Backend HTTP Integration (apps/http)
  HTTP_BACKEND_URL:
    process.env.HTTP_BACKEND_URL || "http://localhost:3000",
  INTERNAL_SERVICE_SECRET:
    process.env.INTERNAL_SERVICE_SECRET ||
    "coursity_internal_microservice_shared_secret_2026",

  // JWT Secret for WebSocket Realtime Token Verification
  JWT_SECRET:
    process.env.JWT_SECRET ||
    process.env.LIVEKIT_API_SECRET ||
    "super_secret_interview_realtime_token_key",

  // =========================================================================
  // Capability-Based Model Configurations (Decoupled from specific vendor names)
  // =========================================================================

  // 1. Reasoning & Cognitive LLM (Planning, Question Gen, Evaluation, Turn Analysis)
  LLM_API_KEY:
    process.env.LLM_API_KEY ||
    process.env.REASONING_LLM_API_KEY ||
    process.env.GEMINI_API_KEY ||
    "",
  LLM_MODEL:
    process.env.LLM_MODEL ||
    process.env.REASONING_LLM_MODEL ||
    process.env.GEMINI_MODEL ||
    "gemini-1.5-flash",
  LLM_PROVIDER:
    process.env.LLM_PROVIDER ||
    process.env.REASONING_LLM_PROVIDER ||
    "gemini",

  // 2. Speech-to-Text / Audio Transcription (Candidate voice streaming -> text)
  STT_API_KEY:
    process.env.STT_API_KEY ||
    process.env.TRANSCRIPTION_STT_API_KEY ||
    process.env.DEEPGRAM_API_KEY ||
    "",
  STT_MODEL:
    process.env.STT_MODEL ||
    process.env.TRANSCRIPTION_STT_MODEL ||
    "nova-2",
  STT_PROVIDER:
    process.env.STT_PROVIDER ||
    process.env.TRANSCRIPTION_STT_PROVIDER ||
    "deepgram",

  // 3. Text-to-Speech / Voice Synthesis (Interviewer voice audio synthesis)
  TTS_API_KEY:
    process.env.TTS_API_KEY ||
    process.env.SYNTHESIS_TTS_API_KEY ||
    process.env.ELEVENLABS_API_KEY ||
    "",
  TTS_MODEL:
    process.env.TTS_MODEL ||
    process.env.SYNTHESIS_TTS_MODEL ||
    "eleven_turbo_v2_5",
  TTS_VOICE_ID:
    process.env.TTS_VOICE_ID ||
    process.env.SYNTHESIS_TTS_VOICE_ID ||
    process.env.ELEVENLABS_VOICE_ID ||
    "21m00Tcm4TlvDq8ikWAM",
  TTS_PROVIDER:
    process.env.TTS_PROVIDER ||
    process.env.SYNTHESIS_TTS_PROVIDER ||
    "elevenlabs",

  // 4. Session Audio Archive Cloud Storage
  STORAGE_REGION:
    process.env.STORAGE_REGION ||
    process.env.AWS_REGION ||
    "us-east-1",
  STORAGE_ACCESS_KEY:
    process.env.STORAGE_ACCESS_KEY ||
    process.env.AWS_ACCESS_KEY_ID ||
    "",
  STORAGE_SECRET_KEY:
    process.env.STORAGE_SECRET_KEY ||
    process.env.AWS_SECRET_ACCESS_KEY ||
    "",
  STORAGE_BUCKET_NAME:
    process.env.STORAGE_BUCKET_NAME ||
    process.env.AWS_S3_BUCKET_NAME ||
    "coursity-media",
};
