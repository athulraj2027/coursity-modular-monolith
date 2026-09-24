import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCurrentUser } from "@/features/auth";
import { useInterviewSession } from "../hooks/useInterviewSession";
import { useAudioDevices } from "../hooks/useAudioDevices";
import { CameraPreview } from "../components/CameraPreview";
import { DeviceCheck } from "../components/DeviceCheck";
import { ArrowRight, ArrowLeft, Sparkles, Mic, Video, MicOff, VideoOff, AlertCircle } from "lucide-react";

export const InterviewSetupPage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { data: user } = useCurrentUser();
  const { session, loading, error, startSession } = useInterviewSession(sessionId);

  const isTeacher = user?.role?.toUpperCase() === "TEACHER" || session?.type === "TEACHER_VETTING";

  const handleReturn = () => {
    if (isTeacher) {
      navigate("/teachers/onboarding/interview");
    } else {
      navigate("/dashboard");
    }
  };

  const {
    stream,
    permissions,
    microphones,
    speakers,
    cameras,
    selectedMicId,
    selectedSpeakerId,
    selectedCameraId,
    setSelectedMicId,
    setSelectedSpeakerId,
    setSelectedCameraId,
    isCameraEnabled,
    isMicEnabled,
    micLevel,
    isPlayingTestTone,
    error: deviceError,
    requestDevices,
    toggleCamera,
    toggleMic,
    testSpeaker,
  } = useAudioDevices();

  useEffect(() => {
    requestDevices(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleJoin = async () => {
    try {
      if (session?.status === "INITIALIZING") {
        await startSession();
      }
      navigate(`/interview/${sessionId}/room`, { replace: true });
    } catch (err) {
      console.error("Failed to start session:", err);
    }
  };

  // If user navigates back to an already completed/evaluated session, redirect immediately
  useEffect(() => {
    if (
      session &&
      (session.status === "COMPLETED" ||
        session.status === "EVALUATED" ||
        session.status === "EVALUATING" ||
        session.status === "CANCELLED" ||
        session.status === "ABANDONED")
    ) {
      if (isTeacher) {
        navigate("/teachers/onboarding/interview", { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }
    }
  }, [session, isTeacher, navigate]);

  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-[#F42A18] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-medium text-neutral-400">Loading audio/video setup...</p>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-neutral-900 border border-neutral-800 rounded-3xl text-center space-y-4 text-white">
        <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-400 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold">Session Unavailable</h2>
        <p className="text-xs text-neutral-400">{error || "Could not retrieve session details."}</p>
        <button
          onClick={handleReturn}
          className="px-5 py-2.5 bg-[#F42A18] text-white text-xs font-semibold rounded-xl cursor-pointer"
        >
          Return to {isTeacher ? "Onboarding" : "Dashboard"}
        </button>
      </div>
    );
  }

  const candidateName = session.user?.name || "Candidate";

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 space-y-6">
      {/* Top Breadcrumb Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(`/interview/${sessionId}`)}
          className="flex items-center gap-1.5 text-xs font-medium text-neutral-400 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Overview
        </button>
        <span className="text-xs font-mono text-neutral-500">Session ID: {sessionId?.slice(0, 8)}...</span>
      </div>

      {deviceError && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-amber-300 text-xs flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{deviceError} — Please ensure browser permissions are granted for microphone access.</span>
        </div>
      )}

      {/* Main Setup Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Video Tile & In-Place Controls (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <CameraPreview
            stream={stream}
            candidateName={candidateName}
            isCameraOn={isCameraEnabled}
            isMicMuted={!isMicEnabled}
            micLevel={micLevel}
            className="w-full aspect-video min-h-[320px]"
          />

          {/* Bottom Quick Toggles */}
          <div className="flex items-center justify-center gap-3 p-3 bg-neutral-900 border border-neutral-800 rounded-2xl">
            <button
              onClick={toggleMic}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition ${
                !isMicEnabled
                  ? "bg-red-500/20 text-red-400 border border-red-500/30"
                  : "bg-neutral-800 text-white hover:bg-neutral-700"
              }`}
            >
              {!isMicEnabled ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              <span>{!isMicEnabled ? "Mic Muted" : "Mic On"}</span>
            </button>

            <button
              onClick={toggleCamera}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition ${
                !isCameraEnabled
                  ? "bg-red-500/20 text-red-400 border border-red-500/30"
                  : "bg-neutral-800 text-white hover:bg-neutral-700"
              }`}
            >
              {!isCameraEnabled ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
              <span>{!isCameraEnabled ? "Camera Off" : "Camera On"}</span>
            </button>
          </div>
        </div>

        {/* Right Column: Hardware Check & Join Box (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          <DeviceCheck
            microphones={microphones}
            speakers={speakers}
            cameras={cameras}
            selectedMicId={selectedMicId}
            selectedSpeakerId={selectedSpeakerId}
            selectedCameraId={selectedCameraId}
            onSelectMic={setSelectedMicId}
            onSelectSpeaker={setSelectedSpeakerId}
            onSelectCamera={setSelectedCameraId}
            micLevel={micLevel}
            isPlayingTestTone={isPlayingTestTone}
            onTestSpeaker={testSpeaker}
            onRequestPermissions={() => requestDevices(true)}
            hasPermissions={permissions}
          />

          {/* Join Interview Card */}
          <div className="p-6 bg-gradient-to-br from-neutral-900 to-neutral-950 border border-neutral-800 rounded-2xl space-y-4 shadow-xl">
            <div className="space-y-1">
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#F42A18]" /> Ready to Begin?
              </h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Clicking Join will connect you immediately to the live AI interviewer room.
              </p>
            </div>

            <button
              onClick={handleJoin}
              className="w-full py-4 rounded-xl bg-[#F42A18] hover:bg-[#d82212] text-white font-bold text-sm shadow-xl hover:shadow-red-500/25 flex items-center justify-center gap-2 transition"
            >
              <span>Join Interview Room</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewSetupPage;
