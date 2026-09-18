import { useState, useEffect, useCallback } from "react";
import { interviewApi } from "../api/interview.api";
import type { InterviewSession, RealtimeToken } from "../types/interview.types";

export function useInterviewSession(sessionId?: string) {
  const [session, setSession] = useState<InterviewSession | null>(null);
  const [realtimeToken, setRealtimeToken] = useState<RealtimeToken | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSession = useCallback(async () => {
    if (!sessionId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await interviewApi.getSession(sessionId);
      setSession(res.data);

      if (res.data.status === "INITIALIZING" || res.data.status === "IN_PROGRESS") {
        const tokenRes = await interviewApi.getRealtimeToken(sessionId);
        setRealtimeToken(tokenRes.data);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load interview session");
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    loadSession();
  }, [loadSession]);

  const startSession = async () => {
    if (!sessionId) return null;
    try {
      const res = await interviewApi.startSession(sessionId);
      setSession(res.data);
      const tokenRes = await interviewApi.getRealtimeToken(sessionId);
      setRealtimeToken(tokenRes.data);
      return res.data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const completeSession = async () => {
    if (!sessionId) return null;
    try {
      const res = await interviewApi.completeSession(sessionId);
      setSession(res.data);
      return res.data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  return {
    session,
    realtimeToken,
    loading,
    error,
    reload: loadSession,
    startSession,
    completeSession,
  };
}
