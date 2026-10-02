import React, { useState } from "react";
import {
  Users,
  CheckCircle2,
  RotateCcw,
  Clock,
  Loader2,
  Search,
  Award,
  Filter,
  Eye,
  User,
  AlertCircle,
} from "lucide-react";
import { ModalTemplate as Modal } from "@/components/common/ModalTemplate";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useHomeworkSubmissions } from "../hooks/useHomework";
import type { Homework, HomeworkSubmission } from "../types/homework.types";
import { HomeworkStatusBadge } from "./HomeworkStatusBadge";
import { SubmissionReviewModal } from "./SubmissionReviewModal";

interface TeacherSubmissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  homework: Homework | null;
}

type FilterTab = "ALL" | "PENDING" | "VERIFIED" | "REDO" | "LATE";

export const TeacherSubmissionsModal: React.FC<TeacherSubmissionsModalProps> = ({
  isOpen,
  onClose,
  homework,
}) => {
  const [activeTab, setActiveTab] = useState<FilterTab>("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSubmissionToReview, setSelectedSubmissionToReview] =
    useState<HomeworkSubmission | null>(null);

  const { data, isLoading, refetch } = useHomeworkSubmissions(
    isOpen && homework ? homework.id : null
  );

  if (!homework) return null;

  const submissions = data?.submissions || [];

  const filteredSubmissions = submissions.filter((sub) => {
    // Tab filter
    if (activeTab === "PENDING" && sub.verificationStatus !== "PENDING") return false;
    if (activeTab === "VERIFIED" && sub.verificationStatus !== "VERIFIED") return false;
    if (activeTab === "REDO" && sub.verificationStatus !== "REDO") return false;
    if (activeTab === "LATE" && !sub.isLate) return false;

    // Search filter
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchName = sub.studentName?.toLowerCase().includes(q);
      const matchEmail = sub.studentEmail?.toLowerCase().includes(q);
      if (!matchName && !matchEmail) return false;
    }

    return true;
  });

  const pendingCount = submissions.filter((s) => s.verificationStatus === "PENDING").length;
  const verifiedCount = submissions.filter((s) => s.verificationStatus === "VERIFIED").length;
  const redoCount = submissions.filter((s) => s.verificationStatus === "REDO").length;
  const lateCount = submissions.filter((s) => s.isLate).length;

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={`Submissions: ${homework.title}`}
        maxWidth="2xl"
      >
        <div className="space-y-4">
          {/* Header Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg flex flex-col">
              <span className="text-[11px] text-slate-500 font-medium">Total Received</span>
              <span className="text-xl font-bold text-slate-100">{submissions.length}</span>
            </div>
            <div className="p-3 bg-amber-500/5 border border-amber-500/20 rounded-lg flex flex-col">
              <span className="text-[11px] text-amber-400 font-medium">Pending Review</span>
              <span className="text-xl font-bold text-amber-400">{pendingCount}</span>
            </div>
            <div className="p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-lg flex flex-col">
              <span className="text-[11px] text-emerald-400 font-medium">Verified / Passed</span>
              <span className="text-xl font-bold text-emerald-400">{verifiedCount}</span>
            </div>
            <div className="p-3 bg-rose-500/5 border border-rose-500/20 rounded-lg flex flex-col">
              <span className="text-[11px] text-rose-400 font-medium">Redo Required</span>
              <span className="text-xl font-bold text-rose-400">{redoCount}</span>
            </div>
          </div>

          {/* Controls: Search & Tabs */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-lg text-xs w-full sm:w-auto overflow-x-auto">
              <button
                type="button"
                onClick={() => setActiveTab("ALL")}
                className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                  activeTab === "ALL"
                    ? "bg-[#F42A18] text-white"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                All ({submissions.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("PENDING")}
                className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                  activeTab === "PENDING"
                    ? "bg-amber-500 text-slate-950 font-semibold"
                    : "text-slate-400 hover:text-amber-400"
                }`}
              >
                Pending ({pendingCount})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("VERIFIED")}
                className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                  activeTab === "VERIFIED"
                    ? "bg-emerald-600 text-white font-semibold"
                    : "text-slate-400 hover:text-emerald-400"
                }`}
              >
                Verified ({verifiedCount})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("REDO")}
                className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                  activeTab === "REDO"
                    ? "bg-rose-600 text-white font-semibold"
                    : "text-slate-400 hover:text-rose-400"
                }`}
              >
                Redo ({redoCount})
              </button>
              {lateCount > 0 && (
                <button
                  type="button"
                  onClick={() => setActiveTab("LATE")}
                  className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                    activeTab === "LATE"
                      ? "bg-amber-600 text-white font-semibold"
                      : "text-slate-400 hover:text-amber-400"
                  }`}
                >
                  Late ({lateCount})
                </button>
              )}
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                placeholder="Search student..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 bg-slate-900 border-slate-800 text-xs text-slate-100 placeholder:text-slate-600 focus:border-[#F42A18] h-9"
              />
            </div>
          </div>

          {/* Submissions List / Table */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-2">
              <Loader2 className="w-8 h-8 text-[#F42A18] animate-spin" />
              <span className="text-xs">Loading student submissions...</span>
            </div>
          ) : filteredSubmissions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center bg-slate-900/40 border border-slate-800 rounded-lg p-6">
              <Users className="w-10 h-10 text-slate-600 mb-2" />
              <p className="text-sm font-semibold text-slate-300">No submissions found</p>
              <p className="text-xs text-slate-500 mt-1 max-w-sm">
                {searchTerm
                  ? "No student matches your search query."
                  : activeTab !== "ALL"
                  ? `No submissions under '${activeTab.toLowerCase()}' category.`
                  : "No students have submitted this assignment yet."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto border border-slate-800 rounded-lg">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 font-semibold">
                  <tr>
                    <th className="py-2.5 px-3">Student</th>
                    <th className="py-2.5 px-3">Submitted At</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Score</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 bg-slate-950/40">
                  {filteredSubmissions.map((sub) => (
                    <tr key={sub.id} className="hover:bg-slate-900/50 transition-colors">
                      {/* Student Info */}
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2.5">
                          {sub.studentAvatar ? (
                            <img
                              src={sub.studentAvatar}
                              alt={sub.studentName || "Student"}
                              className="w-7 h-7 rounded-full object-cover border border-slate-700"
                            />
                          ) : (
                            <div className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
                              <User className="w-3.5 h-3.5" />
                            </div>
                          )}
                          <div className="flex flex-col min-w-0">
                            <span className="font-medium text-slate-200 truncate">
                              {sub.studentName || "Student"}
                            </span>
                            <span className="text-[11px] text-slate-500 truncate">
                              {sub.studentEmail}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Submitted At */}
                      <td className="py-2.5 px-3 whitespace-nowrap text-slate-400">
                        <div>
                          {new Date(sub.submittedAt).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                          })}
                        </div>
                        <span className="text-[11px] text-slate-500">
                          Attempt #{sub.attemptCount}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-2.5 px-3">
                        <HomeworkStatusBadge
                          submissionStatus={sub.status}
                          verificationStatus={sub.verificationStatus}
                          isLate={sub.isLate}
                        />
                      </td>

                      {/* Score */}
                      <td className="py-2.5 px-3">
                        {sub.score !== null && sub.score !== undefined ? (
                          <span className="font-semibold text-amber-400">
                            {sub.score} / {homework.maxScore}
                          </span>
                        ) : (
                          <span className="text-slate-600">—</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-2.5 px-3 text-right">
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => setSelectedSubmissionToReview(sub)}
                          className="h-7 px-2.5 text-xs bg-slate-800 hover:bg-[#F42A18] text-slate-200 hover:text-white transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5 mr-1" />
                          Review
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-end pt-2 border-t border-slate-800">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="text-slate-400 hover:text-slate-200"
            >
              Close
            </Button>
          </div>
        </div>
      </Modal>

      {/* Nested Review & Grade Modal */}
      {selectedSubmissionToReview && (
        <SubmissionReviewModal
          isOpen={Boolean(selectedSubmissionToReview)}
          onClose={() => {
            setSelectedSubmissionToReview(null);
            refetch();
          }}
          submission={selectedSubmissionToReview}
          maxScore={homework.maxScore}
        />
      )}
    </>
  );
};
