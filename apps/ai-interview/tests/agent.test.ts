import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";

import { VadService } from "../src/modules/session/infrastructure/audio/vad.service";
import { AudioRecorderService } from "../src/modules/session/infrastructure/audio/audio-recorder.service";
import { InterviewSessionCoordinator } from "../src/modules/session/application/coordinator/interview-session.coordinator";
import { ISTTService } from "../src/modules/session/domain/ports/stt.port";
import { ITTSService } from "../src/modules/session/domain/ports/tts.port";
import { IBackendSyncService } from "../src/modules/session/domain/ports/backend-sync.port";
import { IAudioStorageService } from "../src/modules/session/domain/ports/audio-storage.port";

// ==========================================
// MOCKS
// ==========================================

class MockWs {
  public sentMessages: any[] = [];
  public readyState: number = 1; // OPEN

  send(data: string) {
    this.sentMessages.push(JSON.parse(data));
  }
}

class MockSttProvider implements ISTTService {
  async transcribeAudio(): Promise<string> {
    return "I have worked with Promises, async/await, and event loops extensively.";
  }
}

class MockTtsProvider implements ITTSService {
  async synthesizeSpeech(): Promise<Buffer> {
    return Buffer.alloc(16000 * 2 * 0.1); // 100ms PCM chunk
  }
}

class MockSyncClient implements IBackendSyncService {
  public initializedSessions: string[] = [];
  public startedSessions: string[] = [];
  public transcripts: any[] = [];
  public endedSessions: any[] = [];
  public abandonedSessions: any[] = [];

  async initializeSession(sessionId: string) {
    this.initializedSessions.push(sessionId);
    return { success: true };
  }

  async startSession(sessionId: string) {
    this.startedSessions.push(sessionId);
    return { success: true };
  }

  async appendTranscript(data: any) {
    this.transcripts.push(data);
    return { success: true };
  }

  async updateMetadata() {
    return { success: true };
  }

  async endSession(data: any) {
    this.endedSessions.push(data);
    return { success: true };
  }

  async abandonSession(sessionId: string, reason?: string) {
    this.abandonedSessions.push({ sessionId, reason });
    return { success: true };
  }
}

class MockS3Storage implements IAudioStorageService {
  async uploadAudioRecording(sessionId: string): Promise<string> {
    return `https://coursity-media.s3.amazonaws.com/recordings/${sessionId}.wav`;
  }
}

// ==========================================
// TEST SUITE
// ==========================================

describe("Session Module & Coordinator Suite", () => {
  describe("VadService (Voice Activity Detection)", () => {
    it("should detect speech start on high energy audio chunk", (t, done) => {
      const vad = new VadService({ silenceThresholdRms: 0.01 });

      vad.on("speech_start", ({ rms }) => {
        assert.ok(rms > 0.01);
        done();
      });

      const loudChunk = Buffer.alloc(1600);
      for (let i = 0; i < loudChunk.length; i += 2) {
        loudChunk.writeInt16LE(15000, i);
      }

      vad.processAudioChunk(loudChunk);
    });
  });

  describe("AudioRecorderService", () => {
    it("should assemble PCM chunks into valid 44-byte WAV header format", () => {
      const recorder = new AudioRecorderService(16000, 1, 16);
      const chunk = Buffer.alloc(3200); // 100ms of audio
      recorder.appendChunk(chunk);

      const wav = recorder.exportWav();
      assert.ok(wav.length >= 44 + 3200);

      // Verify RIFF and WAVE headers
      assert.equal(wav.toString("ascii", 0, 4), "RIFF");
      assert.equal(wav.toString("ascii", 8, 12), "WAVE");
      assert.equal(wav.toString("ascii", 12, 16), "fmt ");
      assert.equal(wav.toString("ascii", 36, 40), "data");
    });
  });

  describe("InterviewSessionCoordinator Integration", () => {
    let mockWs: MockWs;
    let mockSync: MockSyncClient;
    let mockS3: MockS3Storage;
    let coordinator: InterviewSessionCoordinator;

    beforeEach(() => {
      mockWs = new MockWs();
      mockSync = new MockSyncClient();
      mockS3 = new MockS3Storage();

      coordinator = new InterviewSessionCoordinator({
        sessionId: "sess_clean_123",
        candidate: {
          userId: "usr_456",
          name: "Alice Walker",
        },
        domain: "Node.js & Backend",
        difficulty: "INTERMEDIATE",
        totalQuestions: 2,
        topics: ["Asynchronous I/O", "Architecture"],
        ws: mockWs as any,
        sttService: new MockSttProvider(),
        ttsService: new MockTtsProvider(),
        syncService: mockSync,
        storageService: mockS3,
      });
    });

    it("should start interview, send greeting, and sync with backend", async () => {
      await coordinator.start();

      assert.equal(mockSync.startedSessions.length, 1);
      assert.equal(mockSync.startedSessions[0], "sess_clean_123");

      const hasAiSpeakingStart = mockWs.sentMessages.some(
        (m) => m.type === "AI_SPEAKING_START"
      );
      assert.equal(hasAiSpeakingStart, true);
    });

    it("should process candidate text turns and finalize evaluation", async () => {
      await coordinator.start();

      // Turn 1
      await coordinator.handleInboundMessage({
        type: "TEXT_INPUT",
        text: "Node.js uses the V8 engine and libuv for non-blocking I/O.",
      });

      // Complete session explicitly
      await coordinator.handleInboundMessage({
        type: "COMPLETE_SESSION",
      });

      assert.equal(mockSync.endedSessions.length, 1);
      assert.ok(mockSync.endedSessions[0].overallScore >= 0);
      assert.ok(mockSync.endedSessions[0].summaryFeedback.length > 0);

      const hasReport = mockWs.sentMessages.some(
        (m) => m.type === "EVALUATION_REPORT"
      );
      assert.equal(hasReport, true);
    });
  });
});
