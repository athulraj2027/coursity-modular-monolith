import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bot,
  Sparkles,
  X,
  Loader2,
  GraduationCap,
  Code2,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/lib/toast";
import { interviewApi } from "../api/interview.api";
import { useProfile } from "@/features/profile";
import type {
  InterviewTemplate,
  InterviewType,
  InterviewDifficulty,
} from "../types/interview.types";

export interface StartInterviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultType?: InterviewType;
  initialDomain?: string;
  initialDifficulty?: InterviewDifficulty;
}

const INTERVIEW_TYPES: {
  value: InterviewType;
  label: string;
  desc: string;
  icon: LucideIcon;
}[] = [
  {
    value: "TEACHER_VETTING",
    label: "Teacher Vetting",
    desc: "Verify technical depth, syllabus structure, and pedagogical skills",
    icon: GraduationCap,
  },
  {
    value: "TECHNICAL_ASSESSMENT",
    label: "Technical Assessment",
    desc: "Live problem-solving, architectural reasoning, and coding concepts",
    icon: Code2,
  },
  {
    value: "PEDAGOGY_EVALUATION",
    label: "Pedagogy & Delivery",
    desc: "Evaluate teaching style, clarity, communication, and analogies",
    icon: BookOpen,
  },
  {
    value: "MOCK_INTERVIEW",
    label: "Mock Interview",
    desc: "Practice interview with instant multi-agent feedback & scorecard",
    icon: Bot,
  },
];

const DIFFICULTY_LEVELS: {
  value: InterviewDifficulty;
  label: string;
  color: string;
}[] = [
  { value: "BEGINNER", label: "Beginner", color: "text-emerald-500 border-emerald-500/30" },
  { value: "INTERMEDIATE", label: "Intermediate", color: "text-blue-500 border-blue-500/30" },
  { value: "ADVANCED", label: "Advanced", color: "text-purple-500 border-purple-500/30" },
  { value: "EXPERT", label: "Expert", color: "text-amber-500 border-amber-500/30" },
];

export const StartInterviewModal: React.FC<StartInterviewModalProps> = ({
  isOpen,
  onClose,
  defaultType = "TEACHER_VETTING",
  initialDomain = "Software Engineering",
  initialDifficulty = "INTERMEDIATE",
}) => {
  const navigate = useNavigate();
  const { data: profileData } = useProfile();
  const isPassed = Boolean(profileData?.teacherProfile?.isInterviewPassed);

  const [type, setType] = useState<InterviewType>(defaultType);
  const [domain, setDomain] = useState<string>(initialDomain);
  const [difficulty, setDifficulty] = useState<InterviewDifficulty>(initialDifficulty);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [templates, setTemplates] = useState<InterviewTemplate[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setType(defaultType);
      if (initialDomain) setDomain(initialDomain);
      if (initialDifficulty) setDifficulty(initialDifficulty);

      // Fetch active templates
      const fetchTemplates = async () => {
        try {
          setLoadingTemplates(true);
          const res = await interviewApi.getTemplates();
          setTemplates(res.data || []);
        } catch {
          // Templates optional, fallback to custom configuration
        } finally {
          setLoadingTemplates(false);
        }
      };
      fetchTemplates();
    }
  }, [isOpen, defaultType, initialDomain, initialDifficulty]);

  if (!isOpen) return null;

  const handleLaunch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isPassed) {
      toast.error("You have already passed the AI interview assessment.");
      onClose();
      return;
    }
    if (!domain.trim() && !selectedTemplateId) {
      toast.error("Please enter an interview topic or domain.");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await interviewApi.createSession({
        templateId: selectedTemplateId || undefined,
        type,
        domain: domain.trim() || undefined,
        difficulty,
      });

      if (res.success && res.data) {
        toast.success("Interview session initialized!");
        onClose();
        // Navigate directly to hardware setup lobby
        navigate(`/interview/${res.data.id}/setup`);
      } else {
        toast.error(res.message || "Failed to start interview session");
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to initialize interview session");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-2xl text-neutral-900 dark:text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-6 pb-4 border-b border-neutral-100 dark:border-neutral-800 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#F42A18]/10 text-[#F42A18] flex items-center justify-center">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                Start AI Interview
                <Sparkles className="w-4 h-4 text-[#F42A18]" />
              </h2>
              <p className="text-xs text-neutral-500">
                Configure your real-time voice assessment session
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-neutral-600 dark:hover:text-white rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleLaunch} className="p-6 space-y-6">
          {/* Interview Type Selector */}
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-wider text-neutral-500">
              Assessment Type
            </Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {INTERVIEW_TYPES.map((t) => {
                const Icon = t.icon;
                const isSelected = type === t.value && !selectedTemplateId;
                return (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => {
                      setType(t.value);
                      setSelectedTemplateId(null);
                    }}
                    className={`p-3 rounded-2xl border text-left flex flex-col justify-between gap-2 transition-all cursor-pointer ${
                      isSelected
                        ? "border-[#F42A18] bg-[#F42A18]/5 ring-1 ring-[#F42A18]"
                        : "border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-950/40"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon className={`w-4 h-4 ${isSelected ? "text-[#F42A18]" : "text-neutral-500"}`} />
                        <span className="text-xs font-bold">{t.label}</span>
                      </div>
                      {isSelected && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#F42A18]" />
                      )}
                    </div>
                    <p className="text-[11px] text-neutral-500 dark:text-neutral-400 leading-snug">
                      {t.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Template Option (If available) */}
          {(templates.length > 0 || loadingTemplates) && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                  Or Select Curated Template
                </Label>
                {loadingTemplates && <Loader2 className="w-3.5 h-3.5 animate-spin text-neutral-400" />}
              </div>
              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                {templates.map((tpl) => {
                  const isSelected = selectedTemplateId === tpl.id;
                  return (
                    <div
                      key={tpl.id}
                      onClick={() => {
                        setSelectedTemplateId(isSelected ? null : tpl.id);
                        if (!isSelected) {
                          setDomain(tpl.domain);
                          setDifficulty(tpl.difficulty);
                          setType(tpl.type);
                        }
                      }}
                      className={`p-3 rounded-xl border text-xs flex items-center justify-between cursor-pointer transition-all ${
                        isSelected
                          ? "border-[#F42A18] bg-[#F42A18]/5"
                          : "border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700"
                      }`}
                    >
                      <div className="space-y-0.5">
                        <div className="font-semibold">{tpl.title}</div>
                        <div className="text-[10px] text-neutral-500">
                          {tpl.domain} • {tpl.difficulty} • {tpl.maxDurationMinutes || 20} mins
                        </div>
                      </div>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-[#F42A18]" />}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Domain / Focus Subject */}
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-wider text-neutral-500">
              Domain / Interview Focus Topic
            </Label>
            <Input
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="e.g. Distributed Systems, Node.js Backend, React & State Management"
              className="rounded-xl text-xs py-2 bg-neutral-50 dark:bg-neutral-950 border-neutral-200 dark:border-neutral-800"
              required
            />
            <p className="text-[11px] text-neutral-500">
              The AI interviewer will adapt its questions and rubrics to this technical domain.
            </p>
          </div>

          {/* Difficulty Level */}
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-wider text-neutral-500">
              Target Difficulty Level
            </Label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {DIFFICULTY_LEVELS.map((lvl) => {
                const isSelected = difficulty === lvl.value;
                return (
                  <button
                    key={lvl.value}
                    type="button"
                    onClick={() => setDifficulty(lvl.value)}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                      isSelected
                        ? "border-[#F42A18] bg-[#F42A18] text-white shadow-xs"
                        : "border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:border-neutral-300 dark:hover:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-950/40"
                    }`}
                  >
                    {lvl.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Info Banner */}
          {isPassed ? (
            <div className="p-3.5 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 flex items-start gap-3 text-xs text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="font-semibold text-emerald-700 dark:text-emerald-300">
                  AI Assessment Passed & Certified
                </span>
                <p className="text-[11px] leading-relaxed opacity-90">
                  You have already passed the AI vetting interview. Starting a new interview session is restricted.
                </p>
              </div>
            </div>
          ) : (
            <div className="p-3.5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950/80 flex items-start gap-3 text-xs text-neutral-600 dark:text-neutral-400">
              <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="font-semibold text-neutral-900 dark:text-neutral-200">
                  15-20 Min Real-Time Voice Assessment
                </span>
                <p className="text-[11px] leading-relaxed">
                  You will enter a hardware check lobby to verify your microphone and camera before starting the live voice session.
                </p>
              </div>
            </div>
          )}

          {/* Action Footer */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="rounded-xl text-xs font-semibold cursor-pointer"
            >
              Cancel
            </Button>
            {isPassed ? (
              <Button
                type="button"
                onClick={onClose}
                className="gap-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer px-5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Assessment Passed</span>
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={isSubmitting}
                className="gap-2 rounded-xl text-xs font-semibold bg-[#F42A18] hover:bg-[#d92212] text-white cursor-pointer px-5"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Initializing...</span>
                  </>
                ) : (
                  <>
                    <Bot className="w-3.5 h-3.5" />
                    <span>Launch Assessment</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default StartInterviewModal;
