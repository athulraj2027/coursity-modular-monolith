import React from "react";
import {
  X,
  CreditCard,
  Wallet,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Award,
  Video,
  FileText,
  Copy,
  Calendar,
  ExternalLink,
  BookOpen,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAdminEnrollmentDetail } from "../hooks/use-enrollment";
import { toast } from "@/lib/toast";

interface AdminEnrollmentDetailDrawerProps {
  enrollmentId: string | null;
  onClose: () => void;
}

export const AdminEnrollmentDetailDrawer: React.FC<AdminEnrollmentDetailDrawerProps> = ({
  enrollmentId,
  onClose,
}) => {
  const { data, isLoading } = useAdminEnrollmentDetail(enrollmentId || "", {
    enabled: Boolean(enrollmentId),
  });

  if (!enrollmentId) return null;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const enrollment = data?.enrollment;
  const progressList = data?.lessonProgress || [];
  const refund = data?.refund;
  const certificate = data?.certificate;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-2xl bg-white dark:bg-neutral-900 border-l border-neutral-200 dark:border-neutral-800 shadow-2xl flex flex-col">
          
          {/* Header */}
          <div className="px-6 py-5 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between bg-neutral-50/50 dark:bg-neutral-900/50">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-medium text-neutral-500 dark:text-neutral-400">
                  {enrollment?.invoiceNumber || `ENR-${enrollmentId.slice(0, 8)}`}
                </span>
                {enrollment && (
                  <Badge
                    className={
                      enrollment.status === "ACTIVE"
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                        : enrollment.status === "COMPLETED"
                        ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20"
                        : enrollment.status === "REFUNDED"
                        ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                        : "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20"
                    }
                  >
                    {enrollment.status}
                  </Badge>
                )}
              </div>
              <h2 className="text-lg font-bold text-neutral-900 dark:text-white mt-1">
                Enrollment Dossier & Audit
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3 text-neutral-500">
                <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-sm font-medium">Loading enrollment telemetry...</span>
              </div>
            ) : !enrollment ? (
              <div className="text-center py-12 text-neutral-500">Enrollment not found.</div>
            ) : (
              <>
                {/* Student & Course Summary Card */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Student Info */}
                  <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/70 border border-neutral-200 dark:border-neutral-700/60 space-y-3">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                      Student Details
                    </span>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-neutral-200 dark:bg-neutral-700 font-bold text-sm flex items-center justify-center text-neutral-800 dark:text-neutral-200 overflow-hidden shrink-0">
                        {enrollment.studentAvatar ? (
                          <img src={enrollment.studentAvatar} alt={enrollment.studentName} className="w-full h-full object-cover" />
                        ) : (
                          enrollment.studentName?.charAt(0).toUpperCase() || "S"
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-sm text-neutral-900 dark:text-white truncate">
                          {enrollment.studentName}
                        </div>
                        <div className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
                          {enrollment.studentEmail}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Course Info */}
                  <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/70 border border-neutral-200 dark:border-neutral-700/60 space-y-3">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                      Live Cohort / Course
                    </span>
                    <div className="space-y-1">
                      <div className="font-bold text-sm text-neutral-900 dark:text-white line-clamp-1">
                        {enrollment.courseTitle}
                      </div>
                      <div className="text-xs text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
                        <span>Instructor:</span>
                        <span className="font-semibold text-neutral-700 dark:text-neutral-300">
                          {enrollment.instructorName}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 20-Day / 4-Classes Guarantee Audit */}
                <div
                  className={`p-4 rounded-2xl border ${
                    enrollment.status === "REFUNDED"
                      ? "bg-amber-500/5 dark:bg-amber-500/10 border-amber-500/30"
                      : "bg-emerald-500/5 dark:bg-emerald-500/10 border-emerald-500/30"
                  } space-y-3`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {enrollment.status === "REFUNDED" ? (
                        <ShieldAlert className="w-5 h-5 text-amber-500" />
                      ) : (
                        <ShieldCheck className="w-5 h-5 text-emerald-500" />
                      )}
                      <span className="font-bold text-sm text-neutral-900 dark:text-white">
                        20-Day / 4-Classes Refund Guarantee Policy
                      </span>
                    </div>
                    {enrollment.status === "REFUNDED" ? (
                      <Badge className="bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                        100% Refunded
                      </Badge>
                    ) : (
                      <Badge className="bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                        Protected Policy
                      </Badge>
                    )}
                  </div>

                  {enrollment.status === "REFUNDED" && refund ? (
                    <div className="space-y-2 pt-2 border-t border-amber-500/20 text-xs text-neutral-700 dark:text-neutral-300">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <span className="text-neutral-500 dark:text-neutral-400 block">Refund Amount:</span>
                          <span className="font-bold text-sm text-amber-600 dark:text-amber-400">
                            ₹{refund.amount.toLocaleString()}
                          </span>
                        </div>
                        <div>
                          <span className="text-neutral-500 dark:text-neutral-400 block">Destination:</span>
                          <span className="font-semibold">{refund.destination}</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2 pt-1 text-[11px]">
                        <div>
                          <span className="text-neutral-400 block">Classes Conducted:</span>
                          <span className="font-semibold">{refund.classesConductedAtRefund}</span>
                        </div>
                        <div>
                          <span className="text-neutral-400 block">Classes Attended:</span>
                          <span className="font-semibold">{refund.classesAttendedAtRefund}</span>
                        </div>
                        <div>
                          <span className="text-neutral-400 block">Days Elapsed:</span>
                          <span className="font-semibold">{refund.daysElapsedAtRefund} days</span>
                        </div>
                      </div>
                      {refund.reason && (
                        <div className="pt-2">
                          <span className="text-neutral-500 dark:text-neutral-400 block">Refund Reason:</span>
                          <p className="italic bg-amber-500/10 p-2 rounded-xl mt-0.5">{refund.reason}</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-xs text-neutral-600 dark:text-neutral-400 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-neutral-400" />
                      <span>
                        Refund Guarantee Window active until{" "}
                        <strong className="text-neutral-900 dark:text-white">
                          {new Date(enrollment.refundEligibleUntil).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </strong>
                      </span>
                    </div>
                  )}
                </div>

                {/* Financial Breakdown & Transaction Audit */}
                <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/70 border border-neutral-200 dark:border-neutral-700/60 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                      Payment & Settlement Audit
                    </span>
                    <Badge className="bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200 font-semibold text-[11px]">
                      {enrollment.paymentMethod}
                    </Badge>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-neutral-200 dark:border-neutral-700">
                      <span className="text-neutral-500 dark:text-neutral-400">Original Course Tuition:</span>
                      <span className="font-medium text-neutral-900 dark:text-white">
                        ₹{enrollment.originalPrice.toLocaleString()}
                      </span>
                    </div>

                    {enrollment.discountAmount > 0 && (
                      <div className="flex justify-between py-1 border-b border-neutral-200 dark:border-neutral-700 text-emerald-600 dark:text-emerald-400">
                        <span className="flex items-center gap-1.5">
                          <span>Coupon Discount</span>
                          {enrollment.appliedCouponCode && (
                            <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono text-[10px] py-0 px-1">
                              {enrollment.appliedCouponCode}
                            </Badge>
                          )}
                        </span>
                        <span className="font-bold">-₹{enrollment.discountAmount.toLocaleString()}</span>
                      </div>
                    )}

                    <div className="flex justify-between py-1 pt-2 font-bold text-sm text-neutral-900 dark:text-white">
                      <span>Final Net Amount Paid:</span>
                      <span className="text-emerald-600 dark:text-emerald-400">
                        ₹{enrollment.finalAmount.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Transaction IDs */}
                  <div className="pt-3 border-t border-neutral-200 dark:border-neutral-700 space-y-2 text-xs">
                    {enrollment.invoiceNumber && (
                      <div className="flex items-center justify-between bg-white dark:bg-neutral-900 p-2 rounded-xl border border-neutral-200 dark:border-neutral-800">
                        <span className="text-neutral-500">Invoice Number:</span>
                        <div className="flex items-center gap-1.5 font-mono font-medium">
                          <span>{enrollment.invoiceNumber}</span>
                          <button
                            onClick={() => copyToClipboard(enrollment.invoiceNumber!, "Invoice Number")}
                            className="p-1 hover:text-emerald-500 cursor-pointer"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )}

                    {enrollment.razorpayPaymentId && (
                      <div className="flex items-center justify-between bg-white dark:bg-neutral-900 p-2 rounded-xl border border-neutral-200 dark:border-neutral-800">
                        <span className="text-neutral-500">Razorpay Payment ID:</span>
                        <div className="flex items-center gap-1.5 font-mono font-medium">
                          <span className="truncate max-w-[180px]">{enrollment.razorpayPaymentId}</span>
                          <button
                            onClick={() => copyToClipboard(enrollment.razorpayPaymentId!, "Payment ID")}
                            className="p-1 hover:text-emerald-500 cursor-pointer"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Progress & Live Class Attendance */}
                <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/70 border border-neutral-200 dark:border-neutral-700/60 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                      Curriculum Progress & Attendance
                    </span>
                    <span className="font-bold text-xs text-neutral-900 dark:text-white">
                      {Math.round(enrollment.progressPercentage)}% Completed
                    </span>
                  </div>

                  <div className="w-full h-2 rounded-full bg-neutral-200 dark:bg-neutral-700 overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, enrollment.progressPercentage)}%` }}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="p-2.5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-center">
                      <span className="text-[10px] text-neutral-500 block">Classes Attended</span>
                      <span className="font-bold text-sm text-neutral-900 dark:text-white">
                        {enrollment.attendedClassesCount} live sessions
                      </span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-center">
                      <span className="text-[10px] text-neutral-500 block">Lessons Completed</span>
                      <span className="font-bold text-sm text-neutral-900 dark:text-white">
                        {enrollment.completedLessonsCount} / {enrollment.totalLessons || "-"}
                      </span>
                    </div>
                  </div>

                  {/* Lesson Progress Breakdown */}
                  {progressList.length > 0 && (
                    <div className="space-y-1.5 pt-2 max-h-48 overflow-y-auto pr-1">
                      {progressList.map((lp) => (
                        <div
                          key={lp.id}
                          className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs"
                        >
                          <div className="flex items-center gap-2 truncate pr-2">
                            {lp.lessonType === "LIVE" ? (
                              <Video className="w-3.5 h-3.5 text-red-500 shrink-0" />
                            ) : (
                              <FileText className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                            )}
                            <span className="truncate font-medium text-neutral-800 dark:text-neutral-200">
                              {lp.lessonTitle || "Lesson"}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            {lp.attendedLive && (
                              <Badge className="bg-purple-500/10 text-purple-600 dark:text-purple-400 text-[10px] py-0 px-1">
                                Attended Live
                              </Badge>
                            )}
                            {lp.isCompleted ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                            ) : (
                              <Clock className="w-4 h-4 text-neutral-400" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Verified Certificate */}
                {certificate && (
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center">
                        <Award className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="font-bold text-sm text-neutral-900 dark:text-white block">
                          Verified Completion Certificate
                        </span>
                        <span className="text-xs font-mono text-neutral-500">
                          {certificate.certificateCode}
                        </span>
                      </div>
                    </div>
                    <a
                      href={`/certificates/${certificate.certificateCode}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 text-white font-semibold text-xs hover:bg-amber-600 transition-colors"
                    >
                      <span>View</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50 flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="rounded-xl border-neutral-200 dark:border-neutral-800 cursor-pointer"
            >
              Close Dossier
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
