import React from "react";
import { useParams, useNavigate, useSearchParams, Link } from "react-router-dom";
import { useCourseBySlug } from "@/features/course/hooks/useCourses";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Receipt,
  ShieldCheck,
  Calendar,
  Clock,
  BookOpen,
  User,
  Radio,
  PlayCircle,
  Layers,
  GraduationCap,
} from "lucide-react";

export const CourseCheckoutSuccessPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const { data: course, isLoading } = useCourseBySlug(slug || "");

  const paymentType = searchParams.get("type") || "razorpay";
  const orderId = searchParams.get("orderId");
  const paymentId = searchParams.get("paymentId");
  const amountParam = searchParams.get("amount");
  const couponCode = searchParams.get("coupon");

  const formattedAmount = amountParam
    ? Number(amountParam).toLocaleString("en-IN", { minimumFractionDigits: 2 })
    : course?.pricingType === "FREE"
    ? "0.00"
    : course?.price
    ? Number(course.price).toLocaleString("en-IN", { minimumFractionDigits: 2 })
    : "0.00";

  const instructor = course?.teacherProfile?.profile?.user;
  const teacherProfile = course?.teacherProfile;

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-4 border-[#F42A18] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-semibold text-neutral-500">Loading enrollment confirmation...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center min-h-[75vh] w-full text-center max-w-3xl mx-auto space-y-8 px-4 py-10">
      {/* 1. Celebration Icon with glowing aura */}
      <div className="relative">
        <div className="w-24 h-24 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mx-auto shadow-2xl shadow-emerald-500/20 animate-in zoom-in-50 duration-300">
          <CheckCircle2 className="w-12 h-12" />
        </div>
        <div className="absolute -top-1 -right-1 p-2 rounded-full bg-[#F42A18] text-white shadow-lg animate-bounce">
          <Sparkles className="w-4 h-4" />
        </div>
      </div>

      {/* 2. Success Title & Subheading */}
      <div className="space-y-3">
        <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-bold text-xs px-3 py-1">
          ✓ Payment & Seat Confirmed
        </Badge>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-neutral-900 dark:text-white">
          Congratulations! You're Enrolled!
        </h1>
        <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 max-w-lg mx-auto leading-relaxed">
          Your seat in the live cohort has been locked in. You now have lifetime access to live interactive lectures, study modules, and community discussions.
        </p>
      </div>

      {/* 3. Course Details & Batch Card */}
      {course && (
        <div className="w-full p-6 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xl text-left space-y-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-neutral-100 dark:border-neutral-800">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                Live Cohort Program
              </span>
            </div>
            <Badge className="bg-[#F42A18]/10 text-[#F42A18] border-red-500/20 font-bold text-xs">
              Batch Confirmed
            </Badge>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 items-start">
            <div className="relative w-full sm:w-36 aspect-video rounded-2xl overflow-hidden bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 shrink-0">
              {course.thumbnail ? (
                <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-neutral-400">
                  <GraduationCap className="w-8 h-8" />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0 space-y-1.5">
              <div className="flex flex-wrap items-center gap-1.5">
                {course.category && (
                  <Badge variant="outline" className="text-[10px] px-2 py-0.5 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
                    {course.category.name}
                  </Badge>
                )}
                <Badge variant="outline" className="text-[10px] px-2 py-0.5 bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20">
                  {course.level.replace("_", " ")}
                </Badge>
              </div>

              <h3 className="text-base sm:text-lg font-black text-neutral-900 dark:text-white leading-snug truncate">
                {course.title}
              </h3>

              <div className="flex items-center gap-2 text-xs text-neutral-500 pt-0.5">
                <div className="w-5 h-5 rounded-full bg-neutral-200 dark:bg-neutral-700 overflow-hidden flex items-center justify-center shrink-0">
                  {teacherProfile?.profile?.avatar ? (
                    <img src={teacherProfile.profile.avatar} alt={instructor?.name} className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-3 h-3 text-neutral-400" />
                  )}
                </div>
                <span>Instructor: <strong>{instructor?.name || "Verified Instructor"}</strong></span>
              </div>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
            <div className="p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/50 dark:border-neutral-800/50 text-center">
              <Radio className="w-4 h-4 text-[#F42A18] mx-auto mb-1" />
              <span className="text-[10px] text-neutral-400 block">Class Format</span>
              <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200">Live Interactive</span>
            </div>
            <div className="p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/50 dark:border-neutral-800/50 text-center">
              <BookOpen className="w-4 h-4 text-[#F42A18] mx-auto mb-1" />
              <span className="text-[10px] text-neutral-400 block">Curriculum</span>
              <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200">{course.totalLessons} Lectures</span>
            </div>
            <div className="p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/50 dark:border-neutral-800/50 text-center col-span-2 sm:col-span-1">
              <Calendar className="w-4 h-4 text-[#F42A18] mx-auto mb-1" />
              <span className="text-[10px] text-neutral-400 block">Cohort Start</span>
              <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                {course.startingDate ? new Date(course.startingDate).toLocaleDateString() : "Immediate Access"}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 4. Order & Transaction Details Card */}
      <div className="w-full p-6 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-left space-y-4 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
          <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Transaction Summary</span>
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            Verified & Recorded
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-[11px] text-neutral-400">Payment Method</span>
            <p className="font-bold text-neutral-900 dark:text-white text-sm mt-0.5 capitalize">
              {paymentType === "wallet"
                ? "Coursity Wallet (100% Credit)"
                : paymentType === "free"
                ? "Free Open Enrollment"
                : "Razorpay Secure Gateway"}
            </p>
          </div>

          <div>
            <span className="text-[11px] text-neutral-400">Total Amount Paid</span>
            <p className="font-mono font-black text-[#F42A18] text-base mt-0.5">
              ₹{formattedAmount}
            </p>
          </div>

          {couponCode && (
            <div>
              <span className="text-[11px] text-neutral-400">Teacher Coupon Applied</span>
              <p className="font-mono font-bold text-emerald-600 mt-0.5">
                {couponCode}
              </p>
            </div>
          )}

          {paymentId && (
            <div>
              <span className="text-[11px] text-neutral-400">Payment Reference ID</span>
              <p className="font-mono text-neutral-700 dark:text-neutral-300 mt-0.5 break-all">
                {paymentId}
              </p>
            </div>
          )}

          {orderId && (
            <div>
              <span className="text-[11px] text-neutral-400">Gateway Order ID</span>
              <p className="font-mono text-neutral-700 dark:text-neutral-300 mt-0.5 break-all">
                {orderId}
              </p>
            </div>
          )}
        </div>

        {/* Guarantee Banner */}
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3 text-xs text-emerald-800 dark:text-emerald-300">
          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="leading-relaxed">
            <strong>20-Day Refund Guarantee:</strong> If this course does not meet your expectations, you can request a 100% full money-back refund within 20 days or before 4 classes from your classroom dashboard.
          </span>
        </div>

        {/* GST Invoice notification */}
        <div className="p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/50 dark:border-neutral-800/50 flex items-center gap-3 text-xs text-neutral-600 dark:text-neutral-400">
          <Receipt className="w-4 h-4 text-[#F42A18] shrink-0" />
          <span>
            A detailed enrollment receipt and tax invoice have been dispatched to your email address.
          </span>
        </div>
      </div>

      {/* 5. Direct Navigation Actions */}
      <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center pt-2">
        <Button
          asChild
          className="w-full sm:w-auto h-12 px-8 rounded-2xl font-bold text-sm bg-[#F42A18] hover:bg-[#d92212] text-white shadow-xl shadow-[#F42A18]/25 cursor-pointer flex items-center justify-center gap-2"
        >
          <Link to={`/learn/${course?.slug || slug}`}>
            <PlayCircle className="w-4 h-4" />
            <span>Enter Live Classroom</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </Button>

        <Button
          asChild
          variant="outline"
          className="w-full sm:w-auto h-12 px-6 rounded-2xl font-semibold text-xs border-neutral-200 dark:border-neutral-800 cursor-pointer"
        >
          <Link to="/students/courses">
            <Layers className="w-4 h-4 mr-1.5" />
            <span>Go to My Enrolled Courses</span>
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default CourseCheckoutSuccessPage;
