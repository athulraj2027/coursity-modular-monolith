import React from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  GraduationCap,
  ArrowLeft,
  User,
  Mail,
  Calendar,
  CreditCard,
  Tag,
  Sparkles,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldAlert,
  ShieldCheck,
  Check,
  Award,
  BookOpen,
  Video,
  FileText,
  Percent,
  IndianRupee,
  ExternalLink,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTeacherEnrollmentDetail } from "../hooks/use-enrollment";
import type { EnrollmentStatus } from "../types/enrollment.types";

export const TeacherEnrollmentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data, isLoading, isError, refetch } = useTeacherEnrollmentDetail(id || "");

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-4 border-[#F42A18] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-semibold text-neutral-500">Loading student enrollment details...</p>
      </div>
    );
  }

  if (isError || !data?.enrollment) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-400">
          <GraduationCap className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Enrollment Not Found</h2>
        <p className="text-xs text-neutral-500 max-w-md">
          This enrollment record may not exist or you do not have permission to view students outside your courses.
        </p>
        <Button
          onClick={() => navigate("/teachers/enrollments")}
          className="bg-[#F42A18] hover:bg-[#D92212] text-white rounded-xl text-xs font-semibold cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          Back to Enrollments
        </Button>
      </div>
    );
  }

  const { enrollment, lessonProgress = [], refund, certificate } = data;
  const isExpired = Boolean(enrollment.refundEligibleUntil && new Date(enrollment.refundEligibleUntil) < new Date());

  const getStatusBadge = (status: EnrollmentStatus) => {
    switch (status) {
      case "ACTIVE":
        return (
          <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-bold text-xs px-2.5 py-0.5 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            ACTIVE LEARNER
          </Badge>
        );
      case "COMPLETED":
        return (
          <Badge className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 font-bold text-xs px-2.5 py-0.5 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" />
            GRADUATED
          </Badge>
        );
      case "REFUNDED":
        return (
          <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-bold text-xs px-2.5 py-0.5 flex items-center gap-1">
            <ShieldAlert className="w-3.5 h-3.5" />
            REFUNDED
          </Badge>
        );
      case "CANCELLED":
        return (
          <Badge className="bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 font-bold text-xs px-2.5 py-0.5 flex items-center gap-1">
            <XCircle className="w-3.5 h-3.5" />
            CANCELLED
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto w-full">
      {/* 1. Breadcrumbs & Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs sm:text-sm text-neutral-500">
          <Link to="/teachers/dashboard" className="hover:text-[#F42A18] transition-colors">
            Dashboard
          </Link>
          <span>/</span>
          <Link to="/teachers/enrollments" className="hover:text-[#F42A18] transition-colors">
            Student Enrollments
          </Link>
          <span>/</span>
          <span className="font-mono font-bold text-neutral-900 dark:text-white">
            {enrollment.invoiceNumber || enrollment.studentName || enrollment.id.substring(0, 8)}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="rounded-xl text-xs border-neutral-200 dark:border-neutral-800 gap-1.5 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </Button>

          <Button
            asChild
            variant="outline"
            size="sm"
            className="rounded-xl text-xs border-neutral-200 dark:border-neutral-800 gap-1.5 cursor-pointer"
          >
            <Link to="/teachers/enrollments">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>All Enrollments</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* 2. Main Title & Action Bar */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800/80 p-6 rounded-3xl shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 flex items-center justify-center font-black text-lg text-neutral-700 dark:text-neutral-300 overflow-hidden shrink-0">
            {enrollment.studentAvatar ? (
              <img
                src={enrollment.studentAvatar}
                alt={enrollment.studentName || "Student"}
                className="w-full h-full object-cover"
              />
            ) : (
              enrollment.studentName?.charAt(0).toUpperCase() || <User className="w-7 h-7 text-neutral-400" />
            )}
          </div>

          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white">
                {enrollment.studentName || "Student Learner"}
              </h1>
              {getStatusBadge(enrollment.status)}
            </div>

            <p className="text-xs text-neutral-500 flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-neutral-400" />
              <span>{enrollment.studentEmail}</span>
              <span>•</span>
              <span className="font-mono">Enrolled {new Date(enrollment.enrolledAt).toLocaleDateString()}</span>
            </p>
          </div>
        </div>

        {/* Course Quick Actions */}
        <div className="flex items-center gap-2.5">
          <Button
            asChild
            variant="outline"
            className="rounded-xl text-xs font-semibold border-neutral-200 dark:border-neutral-800 gap-1.5 cursor-pointer"
          >
            <Link to={`/teachers/courses/${enrollment.courseId}`}>
              <BookOpen className="w-3.5 h-3.5" />
              <span>View Course Studio</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* 3. Performance Metrics Grid (4 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800/80 shadow-sm space-y-1.5">
          <span className="text-xs font-semibold text-neutral-500">Net Tuition Paid</span>
          <p className="text-2xl font-black text-neutral-900 dark:text-white font-mono">
            ₹{enrollment.finalAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </p>
          <span className="text-[11px] text-neutral-400">Via {enrollment.paymentMethod}</span>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800/80 shadow-sm space-y-1.5">
          <span className="text-xs font-semibold text-neutral-500">Coupon Discount</span>
          <p className="text-2xl font-black text-[#F42A18] font-mono">
            {enrollment.discountAmount > 0
              ? `-₹${enrollment.discountAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`
              : "₹0.00"}
          </p>
          <span className="text-[11px] text-neutral-400">
            {enrollment.appliedCouponCode ? `Promo: ${enrollment.appliedCouponCode}` : "Standard pricing applied"}
          </span>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800/80 shadow-sm space-y-1.5">
          <span className="text-xs font-semibold text-neutral-500">Curriculum Progress</span>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
            {Math.round(enrollment.progressPercentage)}%
          </p>
          <span className="text-[11px] text-neutral-400">
            {enrollment.completedLessonsCount} lessons finished
          </span>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800/80 shadow-sm space-y-1.5">
          <span className="text-xs font-semibold text-neutral-500">Live Attendance</span>
          <p className="text-2xl font-black text-blue-600 dark:text-blue-400 font-mono">
            {enrollment.attendedClassesCount} Classes
          </p>
          <span className="text-[11px] text-neutral-400">Live cohort sessions attended</span>
        </div>
      </div>

      {/* 4. Details Breakdown & Curriculum Log */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: Student, Financial, Guarantee & Certificate details */}
        <div className="lg:col-span-1 space-y-6">
          {/* Enrolled Course Summary */}
          <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800/80 shadow-sm space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-400 border-b border-neutral-100 dark:border-neutral-800 pb-3">
              Enrolled Course
            </h3>

            <div className="space-y-2">
              <h4 className="font-bold text-sm text-neutral-900 dark:text-white leading-snug">
                {enrollment.courseTitle}
              </h4>
              <div className="flex flex-wrap items-center gap-2 pt-1">
                {enrollment.courseLevel && (
                  <Badge variant="outline" className="text-[10px]">
                    {enrollment.courseLevel}
                  </Badge>
                )}
                {enrollment.courseStartingDate && (
                  <span className="text-xs text-neutral-500 font-medium">
                    Batch: {new Date(enrollment.courseStartingDate).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Billing & Invoice Breakdown */}
          <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800/80 shadow-sm space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-400 border-b border-neutral-100 dark:border-neutral-800 pb-3">
              Financial Breakdown
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="text-neutral-500">Base Course Tuition:</span>
                <span className="font-bold text-neutral-900 dark:text-white font-mono">
                  ₹{enrollment.originalPrice.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </span>
              </div>

              {enrollment.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span className="flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5" />
                    <span>Coupon Discount ({enrollment.appliedCouponCode}):</span>
                  </span>
                  <span className="font-bold font-mono">
                    -₹{enrollment.discountAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </span>
                </div>
              )}

              <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800 flex justify-between text-sm">
                <span className="font-bold text-neutral-900 dark:text-white">Net Paid:</span>
                <span className="font-bold text-neutral-900 dark:text-white font-mono">
                  ₹{enrollment.finalAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 space-y-2 text-[11px] text-neutral-500">
                <div className="flex justify-between">
                  <span>Payment Gateway:</span>
                  <span className="font-medium text-neutral-800 dark:text-neutral-200">
                    {enrollment.paymentMethod}
                  </span>
                </div>
                {enrollment.invoiceNumber && (
                  <div className="flex justify-between">
                    <span>Invoice #:</span>
                    <span className="font-mono font-medium text-neutral-800 dark:text-neutral-200">
                      {enrollment.invoiceNumber}
                    </span>
                  </div>
                )}
                {enrollment.razorpayPaymentId && (
                  <div className="flex justify-between">
                    <span>Payment ID:</span>
                    <span className="font-mono text-neutral-400">
                      {enrollment.razorpayPaymentId}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 20-Day Refund Guarantee Policy Status */}
          <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800/80 shadow-sm space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-400 border-b border-neutral-100 dark:border-neutral-800 pb-3">
              Refund Policy Status
            </h3>

            {refund ? (
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-2">
                <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-xs">
                  <ShieldAlert className="w-4 h-4" />
                  <span>Tuition Refunded Under 20-Day Guarantee</span>
                </div>
                <p className="text-xs text-neutral-600 dark:text-neutral-400">
                  <strong>Reason:</strong> "{refund.reason}"
                </p>
                <div className="text-[11px] text-neutral-500 pt-1 font-mono">
                  Refunded ₹{Number(refund.amount).toFixed(2)} to {refund.destination} on{" "}
                  {new Date(refund.processedAt).toLocaleDateString()}
                </div>
              </div>
            ) : (
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-neutral-500">Guarantee Window:</span>
                  <Badge
                    className={
                      !isExpired
                        ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px]"
                        : "bg-neutral-500/10 text-neutral-500 border-neutral-500/20 text-[10px]"
                    }
                  >
                    {!isExpired ? "Window Active" : "Window Closed"}
                  </Badge>
                </div>
                <p className="text-[11px] text-neutral-400">
                  Refund eligible until {new Date(enrollment.refundEligibleUntil).toLocaleDateString()} or within 4 live classes conducted.
                </p>
              </div>
            )}
          </div>

          {/* Completion Certificate Card */}
          {certificate ? (
            <div className="p-6 rounded-3xl bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-transparent border border-blue-500/20 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                <Award className="w-5 h-5" />
                <h3 className="text-sm font-bold">Verified Certificate Issued</h3>
              </div>
              <p className="text-xs text-neutral-600 dark:text-neutral-300">
                Student has met 100% completion criteria and claimed their verified credential.
              </p>
              <div className="p-2.5 rounded-xl bg-white/80 dark:bg-neutral-900/80 border border-blue-500/20 flex items-center justify-between font-mono text-xs">
                <span className="font-bold text-blue-700 dark:text-blue-300">{certificate.certificateCode}</span>
                <span className="text-[10px] text-neutral-400">
                  {new Date(certificate.issuedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ) : (
            <div className="p-5 rounded-3xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/60 dark:border-neutral-800/60 text-center space-y-1.5">
              <Award className="w-6 h-6 text-neutral-400 mx-auto" />
              <p className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Certificate In Progress
              </p>
              <p className="text-[11px] text-neutral-400">
                Will be unlocked once the student achieves full course completion.
              </p>
            </div>
          )}
        </div>

        {/* Right Column: Curriculum Progress & Live Class Attendance Log */}
        <div className="lg:col-span-2 space-y-4">
          <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800/80 shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#F42A18]" />
                <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                  Curriculum Progress & Attendance Record ({lessonProgress.length} Lessons)
                </h3>
              </div>
            </div>

            {lessonProgress.length === 0 ? (
              <div className="py-12 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mx-auto text-neutral-400">
                  <Clock className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-neutral-900 dark:text-white">
                  No Lesson Activity Recorded Yet
                </h4>
                <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                  As the student attends live cohort classes or watches recorded lessons, individual progress telemetry will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {lessonProgress.map((item, idx) => (
                  <div
                    key={item.id || idx}
                    className="p-4 rounded-2xl bg-neutral-50/70 dark:bg-neutral-800/40 border border-neutral-200/60 dark:border-neutral-800/60 flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                          item.isCompleted
                            ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                            : "bg-neutral-200 dark:bg-neutral-700 text-neutral-400"
                        }`}
                      >
                        {item.isCompleted ? <Check className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                      </div>

                      <div className="min-w-0">
                        <span className="font-bold text-xs text-neutral-900 dark:text-white block truncate">
                          {item.lesson?.title || `Lesson #${idx + 1}`}
                        </span>
                        <div className="flex items-center gap-2 text-[11px] text-neutral-400 mt-0.5">
                          <span>{item.lesson?.lessonType || "Live Class"}</span>
                          {item.attendedLive && (
                            <>
                              <span>•</span>
                              <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" />
                                Attended Live ({item.liveAttendanceMinutes} mins)
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      {item.isCompleted ? (
                        <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px]">
                          Completed
                        </Badge>
                      ) : (
                        <Badge className="bg-neutral-500/10 text-neutral-500 text-[10px]">
                          In Progress
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherEnrollmentDetailPage;
