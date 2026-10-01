import { test, describe } from "node:test";
import assert from "node:assert/strict";

import { Participant } from "../src/domain/entities/Participant";
import { ClassSession } from "../src/domain/entities/ClassSession";
import { CreateWebRtcTransportUseCase } from "../src/application/media/CreateWebRtcTransportUseCase";
import { ProduceMediaUseCase } from "../src/application/media/ProduceMediaUseCase";
import { InMemorySessionRegistry } from "../src/infrastructure/registry/InMemorySessionRegistry";
import { ForbiddenError } from "../src/shared/errors/AppErrors";

// Mock WebSocket
const createMockSocket = () =>
  ({
    readyState: 1, // OPEN
    send: () => {},
  } as any);

describe("YouTube Live - Media SFU Broadcast Permission Enforcement", () => {
  test("Teacher participant has full produce and publish permissions", () => {
    const teacher = new Participant({
      userId: "teacher-123",
      role: "TEACHER",
      displayName: "Instructor John",
      socket: createMockSocket(),
    });

    assert.equal(teacher.role, "TEACHER");
    assert.equal(teacher.canProduceAudio, true);
    assert.equal(teacher.canProduceVideo, true);
    assert.equal(teacher.canProduceScreen, true);
    assert.equal(teacher.canPublishMedia(), true);
    assert.equal(teacher.canConsume, true);
  });

  test("Student participant defaults to consumer/viewer-only with zero produce permissions", () => {
    const student = new Participant({
      userId: "student-456",
      role: "STUDENT",
      displayName: "Jane Doe",
      socket: createMockSocket(),
      canProduceAudio: false,
      canProduceVideo: false,
      canProduceScreen: false,
      canConsume: true,
    });

    assert.equal(student.role, "STUDENT");
    assert.equal(student.canProduceAudio, false);
    assert.equal(student.canProduceVideo, false);
    assert.equal(student.canProduceScreen, false);
    assert.equal(student.canPublishMedia(), false);
    assert.equal(student.canConsume, true);
  });

  test("CreateWebRtcTransportUseCase strictly blocks students from creating send transports", async () => {
    const registry = new InMemorySessionRegistry();
    const mockRouter = {
      closed: false,
      rtpCapabilities: {} as any,
      close: () => {},
    } as any;

    const session = new ClassSession("room-yt-live-1", mockRouter, 0);
    const student = new Participant({
      userId: "student-456",
      role: "STUDENT",
      socket: createMockSocket(),
      canProduceAudio: false,
      canProduceVideo: false,
      canProduceScreen: false,
    });
    session.addParticipant(student);
    registry.set(session);

    const createTransportUseCase = new CreateWebRtcTransportUseCase(registry);

    // Student attempting to create send transport
    await assert.rejects(
      () =>
        createTransportUseCase.execute({
          roomId: "room-yt-live-1",
          userId: "student-456",
          direction: "send",
        }),
      (err: any) => {
        assert.ok(err instanceof ForbiddenError);
        assert.match(err.message, /is a viewer-only participant and is not permitted to publish media/);
        return true;
      }
    );
  });

  test("ProduceMediaUseCase strictly blocks students from producing audio or video", async () => {
    const registry = new InMemorySessionRegistry();
    const mockRouter = {
      closed: false,
      rtpCapabilities: {} as any,
      close: () => {},
    } as any;

    const session = new ClassSession("room-yt-live-2", mockRouter, 0);
    const student = new Participant({
      userId: "student-789",
      role: "STUDENT",
      socket: createMockSocket(),
      canProduceAudio: false,
      canProduceVideo: false,
      canProduceScreen: false,
    });
    session.addParticipant(student);
    registry.set(session);

    const produceUseCase = new ProduceMediaUseCase(registry);

    // Student attempting to produce audio
    await assert.rejects(
      () =>
        produceUseCase.execute({
          roomId: "room-yt-live-2",
          userId: "student-789",
          transportId: "dummy-transport",
          kind: "audio",
          rtpParameters: {} as any,
        }),
      (err: any) => {
        assert.ok(err instanceof ForbiddenError);
        assert.match(err.message, /is not authorized to publish audio streams/);
        return true;
      }
    );

    // Student attempting to produce video
    await assert.rejects(
      () =>
        produceUseCase.execute({
          roomId: "room-yt-live-2",
          userId: "student-789",
          transportId: "dummy-transport",
          kind: "video",
          rtpParameters: {} as any,
        }),
      (err: any) => {
        assert.ok(err instanceof ForbiddenError);
        assert.match(err.message, /is not authorized to publish video streams/);
        return true;
      }
    );
  });
});
