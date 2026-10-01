import { test, describe, beforeEach } from "node:test";
import assert from "node:assert/strict";

import { ChatMessageEntity } from "../src/domain/entities/ChatMessage";
import { LivePollEntity } from "../src/domain/entities/LivePoll";
import { SendCommentUseCase } from "../src/application/chat/SendCommentUseCase";
import { PinCommentUseCase } from "../src/application/chat/PinCommentUseCase";
import { DeleteCommentUseCase } from "../src/application/chat/DeleteCommentUseCase";
import { CreatePollUseCase } from "../src/application/poll/CreatePollUseCase";
import { VotePollUseCase } from "../src/application/poll/VotePollUseCase";
import { EndPollUseCase } from "../src/application/poll/EndPollUseCase";
import { GetActivePollUseCase } from "../src/application/poll/GetActivePollUseCase";
import { IChatRepository } from "../src/domain/ports/IChatRepository";
import { IPollRepository } from "../src/domain/ports/IPollRepository";
import { IPubSubService } from "../src/domain/ports/IPubSubService";
import { ChatMessage, LivePoll } from "../src/shared/types/ws-signaling.types";

// In-Memory Chat Repository Mock
class InMemoryChatRepository implements IChatRepository {
  public messages = new Map<string, ChatMessage[]>();
  public pinned = new Map<string, ChatMessage | null>();

  async saveMessage(message: ChatMessage): Promise<void> {
    const list = this.messages.get(message.roomId) || [];
    list.push(message);
    this.messages.set(message.roomId, list);
  }

  async getRecentMessages(roomId: string, limit = 50): Promise<ChatMessage[]> {
    const list = this.messages.get(roomId) || [];
    return list.slice(-limit);
  }

  async pinMessage(roomId: string, messageId: string): Promise<ChatMessage | null> {
    const list = this.messages.get(roomId) || [];
    const target = list.find((m) => m.id === messageId);
    if (!target) return null;
    target.isPinned = true;
    this.pinned.set(roomId, target);
    return target;
  }

  async unpinMessage(roomId: string): Promise<void> {
    this.pinned.delete(roomId);
  }

  async getPinnedMessage(roomId: string): Promise<ChatMessage | null> {
    return this.pinned.get(roomId) || null;
  }

  async deleteMessage(roomId: string, messageId: string): Promise<boolean> {
    const list = this.messages.get(roomId) || [];
    const index = list.findIndex((m) => m.id === messageId);
    if (index === -1) return false;
    list.splice(index, 1);
    this.messages.set(roomId, list);
    return true;
  }
}

// In-Memory Poll Repository Mock
class InMemoryPollRepository implements IPollRepository {
  public activePolls = new Map<string, LivePoll>();
  public userVotes = new Map<string, Map<string, string>>(); // roomId:pollId -> userId:optionId

  async saveActivePoll(poll: LivePoll): Promise<void> {
    this.activePolls.set(poll.roomId, poll);
  }

  async getActivePoll(roomId: string): Promise<LivePoll | null> {
    return this.activePolls.get(roomId) || null;
  }

  async recordVote(
    roomId: string,
    pollId: string,
    userId: string,
    optionId: string
  ): Promise<{ poll: LivePoll; previousOptionId?: string } | null> {
    const poll = this.activePolls.get(roomId);
    if (!poll || poll.id !== pollId || poll.status !== "ACTIVE") return null;

    const opt = poll.options.find((o) => o.id === optionId);
    if (!opt) return null;

    const key = `${roomId}:${pollId}`;
    if (!this.userVotes.has(key)) {
      this.userVotes.set(key, new Map());
    }
    const votesMap = this.userVotes.get(key)!;
    const prevVote = votesMap.get(userId);

    if (prevVote) {
      const prevOpt = poll.options.find((o) => o.id === prevVote);
      if (prevOpt && prevOpt.voteCount > 0) prevOpt.voteCount -= 1;
    }

    opt.voteCount += 1;
    votesMap.set(userId, optionId);

    const total = poll.options.reduce((sum, o) => sum + o.voteCount, 0);
    poll.totalVotes = total;
    for (const o of poll.options) {
      o.percentage = total > 0 ? Math.round((o.voteCount / total) * 100) : 0;
    }

    return { poll, previousOptionId: prevVote };
  }

  async getUserVote(roomId: string, pollId: string, userId: string): Promise<string | null> {
    const key = `${roomId}:${pollId}`;
    return this.userVotes.get(key)?.get(userId) || null;
  }

  async endPoll(roomId: string, pollId: string): Promise<LivePoll | null> {
    const poll = this.activePolls.get(roomId);
    if (!poll || poll.id !== pollId) return null;
    poll.status = "ENDED";
    return poll;
  }
}

// In-Memory PubSub Mock
class InMemoryPubSubService implements IPubSubService {
  public publishedEvents: Array<{ channel: string; message: unknown }> = [];

  async publish<T = unknown>(channel: string, message: T): Promise<void> {
    this.publishedEvents.push({ channel, message });
  }

  async subscribe<T = unknown>(
    _channel: string,
    _handler: (message: T) => void
  ): Promise<() => void> {
    return () => {};
  }
}

describe("YouTube Live Broadcast - Comments & Polls Engine", () => {
  let chatRepo: InMemoryChatRepository;
  let pollRepo: InMemoryPollRepository;
  let pubSub: InMemoryPubSubService;

  beforeEach(() => {
    chatRepo = new InMemoryChatRepository();
    pollRepo = new InMemoryPollRepository();
    pubSub = new InMemoryPubSubService();
  });

  describe("Live Comments Subsystem", () => {
    test("Student can post a comment in real-time", async () => {
      const useCase = new SendCommentUseCase(chatRepo, pubSub);
      const msg = await useCase.execute({
        roomId: "room-live-101",
        userId: "student-1",
        displayName: "Alice Student",
        role: "STUDENT",
        message: "Hello teacher! Great live lecture!",
      });

      assert.equal(msg.roomId, "room-live-101");
      assert.equal(msg.userId, "student-1");
      assert.equal(msg.message, "Hello teacher! Great live lecture!");
      assert.equal(msg.isPinned, false);

      const recent = await chatRepo.getRecentMessages("room-live-101");
      assert.equal(recent.length, 1);
      assert.equal(pubSub.publishedEvents.length, 1);
      assert.equal((pubSub.publishedEvents[0].message as any).type, "chat:message");
    });

    test("Teacher can pin an important comment/announcement", async () => {
      const sendUseCase = new SendCommentUseCase(chatRepo, pubSub);
      const msg = await sendUseCase.execute({
        roomId: "room-live-101",
        userId: "teacher-1",
        displayName: "Prof. Smith",
        role: "TEACHER",
        message: "Assignment 2 is due tonight at 11:59 PM.",
      });

      const pinUseCase = new PinCommentUseCase(chatRepo, pubSub);
      const pinned = await pinUseCase.execute({
        roomId: "room-live-101",
        commentId: msg.id,
        pinned: true,
        userId: "teacher-1",
        role: "TEACHER",
      });

      assert.ok(pinned);
      assert.equal(pinned.isPinned, true);

      const retrievedPinned = await chatRepo.getPinnedMessage("room-live-101");
      assert.equal(retrievedPinned?.id, msg.id);
    });

    test("Student is forbidden from pinning comments", async () => {
      const sendUseCase = new SendCommentUseCase(chatRepo, pubSub);
      const msg = await sendUseCase.execute({
        roomId: "room-live-101",
        userId: "student-1",
        displayName: "Alice",
        role: "STUDENT",
        message: "Hey everyone",
      });

      const pinUseCase = new PinCommentUseCase(chatRepo, pubSub);
      await assert.rejects(
        () =>
          pinUseCase.execute({
            roomId: "room-live-101",
            commentId: msg.id,
            pinned: true,
            userId: "student-1",
            role: "STUDENT",
          }),
        /Only teachers or admins can pin/
      );
    });

    test("Teacher can delete inappropriate comments", async () => {
      const sendUseCase = new SendCommentUseCase(chatRepo, pubSub);
      const msg = await sendUseCase.execute({
        roomId: "room-live-101",
        userId: "student-2",
        displayName: "Spammer",
        role: "STUDENT",
        message: "Spam text",
      });

      const deleteUseCase = new DeleteCommentUseCase(chatRepo, pubSub);
      const success = await deleteUseCase.execute({
        roomId: "room-live-101",
        commentId: msg.id,
        userId: "teacher-1",
        role: "TEACHER",
      });

      assert.equal(success, true);
      const messages = await chatRepo.getRecentMessages("room-live-101");
      assert.equal(messages.length, 0);
    });
  });

  describe("Interactive Live Polls Subsystem", () => {
    test("Teacher can create a live poll with options", async () => {
      const createUseCase = new CreatePollUseCase(pollRepo, pubSub);
      const poll = await createUseCase.execute({
        roomId: "room-live-101",
        creatorId: "teacher-1",
        creatorName: "Prof. Smith",
        role: "TEACHER",
        question: "What is the time complexity of QuickSort average case?",
        options: ["O(n)", "O(n log n)", "O(n^2)", "O(log n)"],
        durationSeconds: 90,
      });

      assert.ok(poll.id);
      assert.equal(poll.question, "What is the time complexity of QuickSort average case?");
      assert.equal(poll.options.length, 4);
      assert.equal(poll.status, "ACTIVE");
      assert.equal(poll.totalVotes, 0);
      assert.equal(poll.options[0].voteCount, 0);
      assert.equal(poll.options[0].percentage, 0);

      assert.equal(pubSub.publishedEvents.length, 1);
      assert.equal((pubSub.publishedEvents[0].message as any).type, "poll:created");
    });

    test("Student is forbidden from creating polls", async () => {
      const createUseCase = new CreatePollUseCase(pollRepo, pubSub);
      await assert.rejects(
        () =>
          createUseCase.execute({
            roomId: "room-live-101",
            creatorId: "student-1",
            creatorName: "Student Bob",
            role: "STUDENT",
            question: "Can I create a poll?",
            options: ["Yes", "No"],
          }),
        /Only teachers or admins can create live polls/
      );
    });

    test("Students can vote in polls and receive real-time calculated percentages", async () => {
      const createUseCase = new CreatePollUseCase(pollRepo, pubSub);
      const poll = await createUseCase.execute({
        roomId: "room-live-101",
        creatorId: "teacher-1",
        creatorName: "Prof. Smith",
        role: "TEACHER",
        question: "Which hook is used for side-effects in React?",
        options: ["useState", "useEffect", "useMemo"],
      });

      const opt2Id = poll.options[1].id; // useEffect
      const opt1Id = poll.options[0].id; // useState

      const voteUseCase = new VotePollUseCase(pollRepo, pubSub);

      // Student 1 votes for useEffect
      const vote1 = await voteUseCase.execute({
        roomId: "room-live-101",
        pollId: poll.id,
        userId: "student-1",
        optionId: opt2Id,
      });

      assert.equal(vote1.success, true);
      assert.equal(vote1.results.totalVotes, 1);
      assert.equal(vote1.results.options[1].voteCount, 1);
      assert.equal(vote1.results.options[1].percentage, 100);

      // Student 2 votes for useState
      const vote2 = await voteUseCase.execute({
        roomId: "room-live-101",
        pollId: poll.id,
        userId: "student-2",
        optionId: opt1Id,
      });

      assert.equal(vote2.results.totalVotes, 2);
      assert.equal(vote2.results.options[0].percentage, 50);
      assert.equal(vote2.results.options[1].percentage, 50);

      // Student 3 votes for useEffect (now 2 out of 3 = 67%)
      const vote3 = await voteUseCase.execute({
        roomId: "room-live-101",
        pollId: poll.id,
        userId: "student-3",
        optionId: opt2Id,
      });

      assert.equal(vote3.results.totalVotes, 3);
      assert.equal(vote3.results.options[1].voteCount, 2);
      assert.equal(vote3.results.options[1].percentage, 67);
      assert.equal(vote3.results.options[0].percentage, 33);
    });

    test("Teacher can end a live poll", async () => {
      const createUseCase = new CreatePollUseCase(pollRepo, pubSub);
      const poll = await createUseCase.execute({
        roomId: "room-live-101",
        creatorId: "teacher-1",
        creatorName: "Prof. Smith",
        role: "TEACHER",
        question: "Do you understand the topic?",
        options: ["Yes", "No"],
      });

      const endUseCase = new EndPollUseCase(pollRepo, pubSub);
      const endedPoll = await endUseCase.execute({
        roomId: "room-live-101",
        pollId: poll.id,
        userId: "teacher-1",
        role: "TEACHER",
      });

      assert.equal(endedPoll.status, "ENDED");
    });
  });
});
