import React from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { useCourseBySlug } from "@/features/course/hooks/useCourses";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  ArrowRight,
  Receipt,
  ShieldCheck,
  Calendar,
  Radio,
  PlayCircle,
  Layers,
  User,
  GraduationCap,
  BookOpen,
} from "lucide-react";

export const CourseCheckoutSuccessPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
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

  if (isLoading) {
    return (
      <main className="min-h-[calc(100vh-5rem)] flex flex-col items-center justify-center p-6 text-center">
        <span className="w-8 h-8 border-2 border-neutral-300 border-t-[#F42A18] rounded-full animate-spin inline-block mb-3" />
        <p className="text-xs font-medium text-neutral-500">Loading enrollment confirmation...</p>
      </main>
    );
  }

  return (
    <main className="min-h-[calc(100vh-5rem)] flex items-center justify-center px-4 py-4 sm:py-6">
      <article className="w-full max-w-4xl bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 rounded-2xl shadow-sm overflow-hidden">
        
        {/* Header Bar */}
        <header className="px-6 py-4 border-b border-neutral-100 dark:border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-neutral-50/70 dark:bg-neutral-900/70">
          <section className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </span>
            <section>
              <h1 className="text-base font-bold text-neutral-900 dark:text-white leading-tight">
                Enrollment Confirmed
              </h1>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Your seat has been reserved and your receipt is generated.
              </p>
            </section>
          </section>

          <span className="inline-flex items-center gap-1.5 self-start sm:self-auto text-[11px] font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/80 px-2.5 py-1 rounded-full">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Verified Purchase</span>
          </span>
        </header>

        {/* Content Body: 2-Column Responsive Layout without vertical scrolling */}
        <section className="p-5 sm:p-6 grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* Left Column: Course Details & Next Steps */}
          <section className="md:col-span-7 flex flex-col justify-between space-y-4">
            <section className="space-y-3.5">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                Course Summary
              </h2>

              <article className="p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/70 dark:border-neutral-800/70 flex gap-3.5">
                <figure className="relative w-24 h-20 rounded-lg overflow-hidden bg-neutral-200 dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-700 shrink-0 m-0">
                  {course?.thumbnail ? (
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="w-full h-full flex items-center justify-center text-neutral-400">
                      <GraduationCap className="w-6 h-6" />
                    </span>
                  )}
                </figure>

                <section className="flex-1 min-w-0 space-y-1">
                  <header className="flex flex-wrap items-center gap-1.5">
                    {course?.category && (
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-neutral-200/80 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300">
                        {course.category.name}
                      </span>
                    )}
                    {course?.level && (
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200/60 dark:border-red-900/60">
                        {course.level.replace("_", " ")}
                      </span>
                    )}
                  </header>

                  <h3 className="text-sm font-bold text-neutral-900 dark:text-white leading-snug line-clamp-2">
                    {course?.title || "Course Enrollment"}
                  </h3>

                  <p className="text-xs text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5 pt-0.5">
                    <User className="w-3 h-3 text-neutral-400" />
                    <span>Instructor: <strong className="text-neutral-700 dark:text-neutral-300 font-semibold">{instructor?.name || "Verified Instructor"}</strong></span>
                  </p>
                </section>
              </article>

              {/* Course Meta Info */}
              <section className="grid grid-cols-3 gap-2 text-center">
                <article className="p-2.5 rounded-lg border border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/30">
                  <Radio className="w-3.5 h-3.5 text-[#F42A18] mx-auto mb-1" />
                  <span className="text-[10px] text-neutral-400 block">Format</span>
                  <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">Live Cohort</span>
                </article>
                <article className="p-2.5 rounded-lg border border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/30">
                  <BookOpen className="w-3.5 h-3.5 text-[#F42A18] mx-auto mb-1" />
                  <span className="text-[10px] text-neutral-400 block">Curriculum</span>
                  <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">{course?.totalLessons || 0} Lectures</span>
                </article>
                <article className="p-2.5 rounded-lg border border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/30">
                  <Calendar className="w-3.5 h-3.5 text-[#F42A18] mx-auto mb-1" />
                  <span className="text-[10px] text-neutral-400 block">Schedule</span>
                  <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                    {course?.startingDate ? new Date(course.startingDate).toLocaleDateString() : "Immediate"}
                  </span>
                </article>
              </section>
            </section>

            {/* Direct Action CTAs */}
            <nav className="flex flex-col sm:flex-row items-center gap-3 pt-1">
              <Button
                asChild
                className="w-full sm:w-auto flex-1 h-10 px-5 rounded-xl font-semibold text-xs bg-[#F42A18] hover:bg-[#d92212] text-white shadow-sm cursor-pointer inline-flex items-center justify-center gap-1.5"
              >
                <Link to={`/learn/${course?.slug || slug}`}>
                  <PlayCircle className="w-4 h-4" />
                  <span>Enter Live Classroom</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                className="w-full sm:w-auto h-10 px-4 rounded-xl font-medium text-xs border-neutral-200 dark:border-neutral-800 cursor-pointer inline-flex items-center justify-center gap-1.5"
              >
                <Link to="/students/courses">
                  <Layers className="w-3.5 h-3.5" />
                  <span>My Enrolled Courses</span>
                </Link>
              </Button>
            </nav>
          </section>

          {/* Right Column: Order Receipt & Terms */}
          <section className="md:col-span-5 flex flex-col justify-between space-y-4 md:border-l md:border-neutral-100 md:dark:border-neutral-800 md:pl-6">
            <section className="space-y-3">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                Payment Details
              </h2>

              <dl className="space-y-2.5 text-xs">
                <section className="flex items-center justify-between pb-2 border-b border-neutral-100 dark:border-neutral-800">
                  <dt className="text-neutral-500 dark:text-neutral-400">Payment Status</dt>
                  <dd className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Paid & Recorded</span>
                  </dd>
                </section>

                <section className="flex items-center justify-between">
                  <dt className="text-neutral-500 dark:text-neutral-400">Payment Method</dt>
                  <dd className="font-medium text-neutral-800 dark:text-neutral-200 text-right">
                    {paymentType === "wallet"
                      ? "Coursity Wallet"
                      : paymentType === "free"
                      ? "Free Enrollment"
                      : "Razorpay"}
                  </dd>
                </section>

                {couponCode && (
                  <section className="flex items-center justify-between">
                    <dt className="text-neutral-500 dark:text-neutral-400">Coupon Code</dt>
                    <dd className="font-mono text-emerald-600 font-semibold">{couponCode}</dd>
                  </section>
                )}

                {paymentId && (
                  <section className="flex items-center justify-between gap-2">
                    <dt className="text-neutral-500 dark:text-neutral-400 shrink-0">Payment ID</dt>
                    <dd className="font-mono text-[11px] text-neutral-600 dark:text-neutral-400 truncate text-right max-w-[170px]" title={paymentId}>
                      {paymentId}
                    </dd>
                  </section>
                )}

                {orderId && (
                  <section className="flex items-center justify-between gap-2">
                    <dt className="text-neutral-500 dark:text-neutral-400 shrink-0">Order ID</dt>
                    <dd className="font-mono text-[11px] text-neutral-600 dark:text-neutral-400 truncate text-right max-w-[170px]" title={orderId}>
                      {orderId}
                    </dd>
                  </section>
                )}

                <section className="flex items-center justify-between pt-2 border-t border-neutral-100 dark:border-neutral-800">
                  <dt className="text-sm font-bold text-neutral-900 dark:text-white">Total Paid</dt>
                  <dd className="font-mono text-base font-bold text-neutral-900 dark:text-white">
                    ₹{formattedAmount}
                  </dd>
                </section>
              </dl>
            </section>

            {/* Guarantee & Tax Receipt Note */}
            <footer className="space-y-2 pt-1">
              <section className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-800 dark:text-emerald-300 flex items-start gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <p className="leading-snug">
                  <strong>20-Day Money-Back Guarantee:</strong> Eligible for full refund before 4 classes or within 20 days.
                </p>
              </section>

              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5 px-0.5">
                <Receipt className="w-3 h-3 text-neutral-400 shrink-0" />
                <span>Tax invoice dispatched to your registered email.</span>
              </p>
            </footer>
          </section>

        </section>
      </article>
    </main>
  );
};

export default CourseCheckoutSuccessPage;
