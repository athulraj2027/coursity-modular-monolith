import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Bot,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  ExternalLink,
  ShieldCheck,
  TrendingUp,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DataTableTemplate,
  type TableColumn,
  type TableMetricCard,
  type TableTabOption,
  type TableDropdownFilter,
  type TableSortOption,
} from "@/components/common";
import { useDebounce } from "@/hooks/use-debounce";
import { interviewApi } from "../api/interview.api";
import { OverrideDecisionModal } from "../components/OverrideDecisionModal";
import type {
  InterviewSession,
  InterviewOutcome,
  InterviewDifficulty,
  InterviewType,
} from "../types/interview.types";
import { toast } from "react-toastify";

export const AdminInterviewsPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 300);

  const [activeTab, setActiveTab] = useState<string>("all");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [sortOption, setSortOption] = useState<string>("newest");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Selected session for decision override modal
  const [overrideModalSession, setOverrideModalSession] = useState<InterviewSession | null>(null);

  // Sorting params
  const { sortBy, sortOrder } = useMemo(() => {
    switch (sortOption) {
      case "oldest":
        return { sortBy: "createdAt" as const, sortOrder: "asc" as const };
      case "score-desc":
        return { sortBy: "overallScore" as const, sortOrder: "desc" as const };
      case "score-asc":
        return { sortBy: "overallScore" as const, sortOrder: "asc" as const };
      case "duration-desc":
        return { sortBy: "durationSeconds" as const, sortOrder: "desc" as const };
      case "newest":
      default:
        return { sortBy: "createdAt" as const, sortOrder: "desc" as const };
    }
  }, [sortOption]);

  // Map activeTab to outcome/status query filter
  const outcomeFilter = useMemo(() => {
    if (activeTab === "PASSED" || activeTab === "FAILED" || activeTab === "NEEDS_HUMAN_REVIEW") {
      return activeTab as InterviewOutcome;
    }
    return undefined;
  }, [activeTab]);

  const statusFilter = useMemo(() => {
    if (activeTab === "IN_PROGRESS") {
      return "IN_PROGRESS" as const;
    }
    return undefined;
  }, [activeTab]);

  // Fetch paginated sessions
  const {
    data: sessionsResponse,
    isLoading,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: [
      "admin-interviews",
      currentPage,
      pageSize,
      debouncedSearch,
      outcomeFilter,
      statusFilter,
      difficultyFilter,
      typeFilter,
      sortBy,
      sortOrder,
    ],
    queryFn: () =>
      interviewApi.adminGetSessions({
        page: currentPage,
        limit: pageSize,
        search: debouncedSearch || undefined,
        outcome: outcomeFilter,
        status: statusFilter,
        difficulty: difficultyFilter === "all" ? undefined : (difficultyFilter as InterviewDifficulty),
        type: typeFilter === "all" ? undefined : (typeFilter as InterviewType),
        sortBy,
        sortOrder,
      }),
  });

  // Fetch analytics overview for metric cards
  const { data: analyticsResponse } = useQuery({
    queryKey: ["admin-interviews-analytics"],
    queryFn: () => interviewApi.adminGetAnalyticsOverview(),
    staleTime: 60 * 1000,
  });

  const sessions = sessionsResponse?.data || [];
  const totalItems = sessionsResponse?.meta?.total ?? 0;
  const analytics = analyticsResponse?.data;

  // Decision override mutation
  const overrideDecisionMutation = useMutation({
    mutationFn: ({
      id,
      outcome,
      overallScore,
      adminNote,
    }: {
      id: string;
      outcome: InterviewOutcome;
      overallScore?: number;
      adminNote?: string;
    }) =>
      interviewApi.adminUpdateDecision(id, {
        outcome,
        overallScore,
        adminNote,
      }),
    onSuccess: () => {
      toast.success("Interview decision successfully updated");
      setOverrideModalSession(null);
      queryClient.invalidateQueries({ queryKey: ["admin-interviews"] });
      queryClient.invalidateQueries({ queryKey: ["admin-interviews-analytics"] });
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update decision");
    },
  });

  // Metric cards matching Coursity brand tokens
  const metrics: TableMetricCard[] = [
    {
      label: "Total AI Interviews",
      val: analytics?.totalSessions?.toLocaleString() ?? "0",
      icon: Bot,
      color: "text-[#F42A18]",
    },
    {
      label: "Passed Vetting",
      val: analytics?.passedSessions?.toLocaleString() ?? "0",
      icon: CheckCircle2,
      color: "text-emerald-500",
    },
    {
      label: "Needs Review",
      val: analytics?.needsReviewSessions?.toLocaleString() ?? "0",
      icon: AlertCircle,
      color: "text-amber-500",
    },
    {
      label: "Failed Vetting",
      val: analytics?.failedSessions?.toLocaleString() ?? "0",
      icon: XCircle,
      color: "text-red-500",
    },
    {
      label: "Avg Vetting Score",
      val: `${analytics?.averageScore ? Number(analytics.averageScore).toFixed(1) : "0.0"}%`,
      icon: TrendingUp,
      color: "text-[#F42A18]",
      change: `${analytics?.passRatePercentage ? Number(analytics.passRatePercentage).toFixed(0) : "0"}% Pass Rate`,
    },
  ];

  // Tab filters
  const tabs: TableTabOption[] = [
    { key: "all", label: "All Sessions", count: analytics?.totalSessions },
    { key: "NEEDS_HUMAN_REVIEW", label: "Needs Review", count: analytics?.needsReviewSessions },
    { key: "PASSED", label: "Passed", count: analytics?.passedSessions },
    { key: "FAILED", label: "Failed", count: analytics?.failedSessions },
    { key: "IN_PROGRESS", label: "In Progress", count: analytics?.inProgressSessions },
  ];

  // Dropdown filters
  const dropdownFilters: TableDropdownFilter[] = [
    {
      key: "difficulty",
      label: "Difficulty",
      value: difficultyFilter,
      onChange: (val) => {
        setDifficultyFilter(val);
        setCurrentPage(1);
      },
      options: [
        { label: "All Levels", value: "all" },
        { label: "Beginner", value: "BEGINNER" },
        { label: "Intermediate", value: "INTERMEDIATE" },
        { label: "Advanced", value: "ADVANCED" },
        { label: "Expert", value: "EXPERT" },
      ],
    },
    {
      key: "type",
      label: "Assessment Type",
      value: typeFilter,
      onChange: (val) => {
        setTypeFilter(val);
        setCurrentPage(1);
      },
      options: [
        { label: "All Types", value: "all" },
        { label: "Teacher Vetting", value: "TEACHER_VETTING" },
        { label: "Technical Assessment", value: "TECHNICAL_ASSESSMENT" },
        { label: "Mock Interview", value: "MOCK_INTERVIEW" },
        { label: "Pedagogy Evaluation", value: "PEDAGOGY_EVALUATION" },
      ],
    },
  ];

  // Sort options
  const sortOptions: TableSortOption[] = [
    { label: "Newest First", value: "newest" },
    { label: "Oldest First", value: "oldest" },
    { label: "Highest Score", value: "score-desc" },
    { label: "Lowest Score", value: "score-asc" },
    { label: "Longest Duration", value: "duration-desc" },
  ];

  const hasActiveFilters =
    searchQuery.trim().length > 0 ||
    activeTab !== "all" ||
    difficultyFilter !== "all" ||
    typeFilter !== "all" ||
    sortOption !== "newest";

  const handleResetFilters = () => {
    setSearchQuery("");
    setActiveTab("all");
    setDifficultyFilter("all");
    setTypeFilter("all");
    setSortOption("newest");
    setCurrentPage(1);
  };

  // Helper formatting duration
  const formatDuration = (seconds?: number | null) => {
    if (!seconds || seconds <= 0) return "--";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  // Helper for difficulty badge
  const renderDifficultyBadge = (diff: InterviewDifficulty) => {
    const map: Record<InterviewDifficulty, { bg: string; text: string; border: string }> = {
      BEGINNER: { bg: "bg-emerald-500/10", text: "text-emerald-500", border: "border-emerald-500/20" },
      INTERMEDIATE: { bg: "bg-blue-500/10", text: "text-blue-500", border: "border-blue-500/20" },
      ADVANCED: { bg: "bg-[#F42A18]/10", text: "text-[#F42A18]", border: "border-[#F42A18]/20" },
      EXPERT: { bg: "bg-purple-500/10", text: "text-purple-500", border: "border-purple-500/20" },
    };
    const style = map[diff] || map.INTERMEDIATE;
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-medium border ${style.bg} ${style.text} ${style.border}`}>
        {diff}
      </span>
    );
  };

  // Helper for outcome badge
  const renderOutcomeBadge = (outcome: InterviewOutcome, status: string) => {
    if (status === "IN_PROGRESS") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-blue-500/10 text-blue-500 border border-blue-500/20 animate-pulse">
          <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
          In Progress
        </span>
      );
    }
    if (status === "INITIALIZING" || status === "EVALUATING") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-amber-500/10 text-amber-500 border border-amber-500/20">
          <Clock className="h-3 w-3 animate-spin" />
          {status}
        </span>
      );
    }

    switch (outcome) {
      case "PASSED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Passed
          </span>
        );
      case "NEEDS_HUMAN_REVIEW":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-amber-500/10 text-amber-500 border border-amber-500/20 shadow-sm">
            <AlertCircle className="h-3.5 w-3.5" />
            Needs Review
          </span>
        );
      case "FAILED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-red-500/10 text-red-500 border border-red-500/20">
            <XCircle className="h-3.5 w-3.5" />
            Failed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700">
            Pending
          </span>
        );
    }
  };

  // Table columns definition
  const columns: TableColumn<InterviewSession>[] = [
    {
      header: "Candidate",
      cell: (row) => {
        const candidateName = row.user?.name || "Candidate";
        const candidateEmail = row.user?.email || "No email";
        const initials = candidateName
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
          .slice(0, 2);

        return (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#F42A18]/10 text-[#F42A18] border border-[#F42A18]/20 font-bold text-xs flex items-center justify-center shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <div className="font-semibold text-neutral-900 dark:text-white truncate flex items-center gap-1.5">
                <span
                  className="hover:text-[#F42A18] transition cursor-pointer"
                  onClick={() => navigate(`/admin/interviews/${row.id}`)}
                >
                  {candidateName}
                </span>
              </div>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate">
                {candidateEmail}
              </p>
            </div>
          </div>
        );
      },
    },
    {
      header: "Domain & Assessment",
      cell: (row) => (
        <div>
          <div className="font-medium text-neutral-900 dark:text-neutral-200 text-xs truncate max-w-[220px]">
            {row.domain || row.template?.title || "Technical Vetting"}
          </div>
          <div className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
            {row.type.replace(/_/g, " ")}
          </div>
        </div>
      ),
    },
    {
      header: "Difficulty",
      cell: (row) => renderDifficultyBadge(row.difficulty),
    },
    {
      header: "Outcome & Status",
      cell: (row) => renderOutcomeBadge(row.outcome, row.status),
    },
    {
      header: "Score",
      cell: (row) => {
        const score = row.overallScore !== null && row.overallScore !== undefined ? Number(row.overallScore) : null;
        if (score === null) {
          return <span className="text-xs text-neutral-400 dark:text-neutral-500 font-mono">--</span>;
        }

        const scoreColor =
          score >= 70
            ? "text-emerald-500 bg-emerald-500/10 border-emerald-500/20"
            : score >= 60
            ? "text-amber-500 bg-amber-500/10 border-amber-500/20"
            : "text-red-500 bg-red-500/10 border-red-500/20";

        return (
          <div className="flex items-center gap-2">
            <span className={`px-2 py-0.5 rounded-lg text-xs font-mono font-bold border ${scoreColor}`}>
              {score.toFixed(1)}%
            </span>
          </div>
        );
      },
    },
    {
      header: "Date & Duration",
      cell: (row) => {
        const dateStr = row.startedAt || row.createdAt;
        const formattedDate = dateStr
          ? new Date(dateStr).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })
          : "--";

        return (
          <div className="text-xs">
            <div className="text-neutral-800 dark:text-neutral-200 font-medium">{formattedDate}</div>
            <div className="text-[11px] text-neutral-500 dark:text-neutral-400 flex items-center gap-1 mt-0.5">
              <Clock className="h-3 w-3" />
              {formatDuration(row.durationSeconds)}
            </div>
          </div>
        );
      },
    },
    {
      header: "Actions",
      align: "right",
      cell: (row) => (
        <div className="flex items-center justify-end gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setOverrideModalSession(row)}
            className="h-8 px-2.5 text-xs border-neutral-200 dark:border-neutral-800 bg-transparent hover:bg-[#F42A18]/10 hover:text-[#F42A18] hover:border-[#F42A18]/30 text-neutral-700 dark:text-neutral-300 transition"
            title="Override decision or adjust score"
          >
            <ShieldCheck className="h-3.5 w-3.5 mr-1 text-[#F42A18]" />
            Decision
          </Button>

          <Button
            size="sm"
            onClick={() => navigate(`/admin/interviews/${row.id}`)}
            className="h-8 px-3 text-xs bg-[#F42A18] hover:bg-[#F42A18]/90 text-white shadow-sm shadow-[#F42A18]/20 font-medium"
          >
            Review
            <ExternalLink className="h-3 w-3 ml-1" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <DataTableTemplate<InterviewSession>
        badge={{
          icon: Bot,
          label: "Teacher Vetting & AI Audits",
        }}
        title="AI Interview Assessments"
        description="Monitor real-time candidate interviews, evaluate pedagogical and technical competency scores, and review audio transcripts and anomaly reports."
        headerActions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              refetch();
              queryClient.invalidateQueries({ queryKey: ["admin-interviews-analytics"] });
            }}
            disabled={isFetching}
            className="border-neutral-200 dark:border-neutral-800 bg-transparent hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200 text-xs"
          >
            <RotateCcw className={`h-3.5 w-3.5 mr-1.5 ${isFetching ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        }
        metrics={metrics}
        searchPlaceholder="Search by candidate name or email..."
        searchQuery={searchQuery}
        onSearchChange={(q) => {
          setSearchQuery(q);
          setCurrentPage(1);
        }}
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={(key) => {
          setActiveTab(key);
          setCurrentPage(1);
        }}
        dropdownFilters={dropdownFilters}
        sortOptions={sortOptions}
        currentSort={sortOption}
        onSortChange={(opt) => {
          setSortOption(opt);
          setCurrentPage(1);
        }}
        hasActiveFilters={hasActiveFilters}
        onResetFilters={handleResetFilters}
        columns={columns}
        data={sessions}
        keyExtractor={(item) => item.id}
        isLoading={isLoading}
        emptyState={{
          icon: Bot,
          title: "No AI Interview Sessions Found",
          description: hasActiveFilters
            ? "Try resetting your active filters or search terms."
            : "Candidate interviews will appear here as teachers complete their automated vetting.",
        }}
        pagination={{
          currentPage,
          pageSize,
          totalItems,
          onPageChange: setCurrentPage,
          onPageSizeChange: (size) => {
            setPageSize(size);
            setCurrentPage(1);
          },
          pageSizeOptions: [5, 10, 20, 50],
        }}
      />

      {/* Decision Override Modal */}
      <OverrideDecisionModal
        session={overrideModalSession}
        isOpen={Boolean(overrideModalSession)}
        onClose={() => setOverrideModalSession(null)}
        onConfirm={async ({ outcome, overallScore, adminNote }) => {
          if (!overrideModalSession) return;
          await overrideDecisionMutation.mutateAsync({
            id: overrideModalSession.id,
            outcome,
            overallScore,
            adminNote,
          });
        }}
        isLoading={overrideDecisionMutation.isPending}
      />
    </div>
  );
};

export default AdminInterviewsPage;
