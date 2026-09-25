import React from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { useCourseBySlug } from "@/features/course/hooks/useCourses";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  XCircle,
  RotateCcw,
  ArrowLeft,
  ShieldAlert,
  Wallet,
  GraduationCap,
  User,
  Radio,
  Clock,
  HelpCircle,
} from "lucide-react";

export const CourseCheckoutFailedPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams] = useSearchParams();

  const { data: course, isLoading } = useCourseBySlug(slug || "");

  const reason =
    searchParams.get("reason") ||
    "Your payment could not be authorized by your bank or the checkout window was closed before completion.";

  const checkoutUrl = `/courses/${slug}/checkout`;

  const instructor = course?.teacherProfile?.profile?.user;
  const teacherProfile = course?.teacherProfile;

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-4 border-[#F42A18] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-semibold text-neutral-500">Checking checkout status...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center min-h-[75vh] w-full text-center max-w-2xl mx-auto space-y-8 px-4 py-10">
      {/* 1. Failure Icon */}
      <div className="relative">
        <div className="w-24 h-24 rounded-full bg-red-500/10 border-2 border-red-500/30 flex items-center justify-center text-red-600 dark:text-red-400 mx-auto shadow-2xl shadow-red-500/15 animate-in zoom-in-50 duration-300">
          <XCircle className="w-12 h-12" />
        </div>
      </div>

      {/* 2. Failure Title & Message */}
      <div className="space-y-3">
        <Badge className="bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 font-bold text-xs px-3 py-1">
          Payment Incomplete
        </Badge>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-neutral-900 dark:text-white">
          Enrollment Payment Not Completed
        </h1>
        <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 max-w-md mx-auto leading-relaxed">
          {reason}
        </p>
      </div>

      {/* 3. Course Preview Card */}
      {course && (
        <div className="w-full p-5 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm text-left flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="relative w-16 h-12 rounded-xl overflow-hidden bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 shrink-0">
              {course.thumbnail ? (
                <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-neutral-400">
                  <GraduationCap className="w-5 h-5" />
                </div>
              )}
            </div>

            <div className="min-w-0 space-y-0.5">
              <span className="text-[10px] uppercase font-bold text-neutral-400 block tracking-wider">
                Attempted Course
              </span>
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white truncate">
                {course.title}
              </h3>
              <p className="text-[11px] text-neutral-500 truncate">
                {instructor?.name || "Verified Instructor"} • {course.pricingType === "FREE" ? "Free" : `₹${course.price}`}
              </p>
            </div>
          </div>

          <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 text-xs font-semibold shrink-0">
            Seat on hold
          </Badge>
        </div>
      )}

      {/* 4. Troubleshooting Guide */}
      <div className="w-full p-6 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-left space-y-3.5 shadow-sm text-xs">
        <div className="flex items-center gap-2 font-bold text-neutral-900 dark:text-white">
          <ShieldAlert className="w-4 h-4 text-amber-500" />
          <span>Why did this payment not go through?</span>
        </div>

        <ul className="space-y-2 text-[11px] text-neutral-600 dark:text-neutral-400">
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0 mt-1.5" />
            <span><strong>UPI or Card timeout:</strong> The authorization request timed out or was declined in your UPI / banking application.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0 mt-1.5" />
            <span><strong>3D Secure OTP:</strong> The bank verification OTP was either entered incorrectly or expired.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0 mt-1.5" />
            <span><strong>Transaction limit:</strong> Your bank account or debit/credit card daily online transaction limits might have been reached.</span>
          </li>
        </ul>

        <div className="p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/50 dark:border-neutral-800/50 text-[11px] text-neutral-500 dark:text-neutral-400 leading-relaxed">
          💡 <strong>Safe & Protected:</strong> If any funds were deducted from your bank account, they will be automatically refunded by your banking network within 2-3 business days.
        </div>
      </div>

      {/* 5. Navigation & Retry Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center pt-2">
        <Button
          asChild
          className="w-full sm:w-auto h-12 px-8 rounded-2xl font-bold text-sm bg-[#F42A18] hover:bg-[#d92212] text-white shadow-xl shadow-[#F42A18]/25 cursor-pointer flex items-center justify-center gap-2"
        >
          <Link to={checkoutUrl}>
            <RotateCcw className="w-4 h-4" />
            <span>Retry Checkout Payment</span>
          </Link>
        </Button>

        <Button
          asChild
          variant="outline"
          className="w-full sm:w-auto h-12 px-6 rounded-2xl font-semibold text-xs border-neutral-200 dark:border-neutral-800 cursor-pointer"
        >
          <Link to={`/courses/${course?.slug || slug}`}>
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            <span>Back to Course Syllabus</span>
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default CourseCheckoutFailedPage;
