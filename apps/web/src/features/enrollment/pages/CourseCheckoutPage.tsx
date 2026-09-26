import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useCourseBySlug } from "@/features/course/hooks/useCourses";
import { useCurrentUser } from "@/features/auth";
import { useMyWallet } from "@/features/wallet/hooks/useWallet";
import {
  useEnrollFreeCourse,
  useCreateCourseOrder,
  useVerifyCoursePayment,
  usePayWithWallet,
  useMyEnrollments,
} from "../hooks/use-enrollment";
import { couponApi } from "@/features/coupons/api/coupon.api";
import { WishlistButton } from "@/features/wishlist/components/WishlistButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/lib/toast";
import type { CouponValidationResult } from "@/features/coupons/types/coupon.types";
import {
  Sparkles,
  ShieldCheck,
  ShieldAlert,
  Tag,
  Wallet as WalletIcon,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Clock,
  Video,
  Loader2,
  BookOpen,
  Award,
  Calendar,
  Layers,
  ChevronRight,
  ArrowLeft,
  Lock,
  User,
  Radio,
  Check,
  HelpCircle,
} from "lucide-react";

export const CourseCheckoutPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const { data: currentUser, isLoading: isAuthLoading } = useCurrentUser();
  const { data: course, isLoading: isCourseLoading, isError } = useCourseBySlug(slug || "");
  const { data: wallet } = useMyWallet();
  const { data: myEnrollments = [] } = useMyEnrollments(undefined, {
    enabled: Boolean(currentUser),
  });

  const enrollFreeMutation = useEnrollFreeCourse();
  const createOrderMutation = useCreateCourseOrder();
  const verifyPaymentMutation = useVerifyCoursePayment();
  const payWithWalletMutation = usePayWithWallet();

  // Student Billing Information Form State
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [stateName, setStateName] = useState("Karnataka");
  const [country, setCountry] = useState("India");

  // Coupon & Wallet State
  const [couponCode, setCouponCode] = useState("");
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<CouponValidationResult | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [useWallet, setUseWallet] = useState(false);

  // Checkout Processing State
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sync current user details
  useEffect(() => {
    if (currentUser) {
      if (currentUser.name && !fullName) setFullName(currentUser.name);
      if (currentUser.email && !email) setEmail(currentUser.email);
      if (currentUser.phone && !phone) setPhone(currentUser.phone);
    }
  }, [currentUser]);

  // Loading Screen
  if (isCourseLoading || isAuthLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-4 border-[#F42A18] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-semibold text-neutral-500">Preparing secure checkout...</p>
      </div>
    );
  }

  // Course Not Found Screen
  if (isError || !course) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-400">
          <BookOpen className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Course Not Found</h2>
        <p className="text-xs text-neutral-500 max-w-md">
          The course you are attempting to checkout is unavailable or does not exist.
        </p>
        <Button
          onClick={() => navigate("/courses")}
          className="bg-[#F42A18] hover:bg-[#D92212] text-white rounded-xl text-xs font-semibold cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          Browse All Courses
        </Button>
      </div>
    );
  }

  const instructor = course.teacherProfile?.profile?.user;
  const teacherProfile = course.teacherProfile;
  const isStarted = Boolean(course.startingDate && new Date(course.startingDate).getTime() <= Date.now());

  // Check if user has an existing enrollment record
  const userEnrollment = myEnrollments.find((e) => e.courseId === course.id);
  const existingEnrollment = userEnrollment?.status === "ACTIVE" ? userEnrollment : null;
  const isRefundedEnrollment = userEnrollment?.status === "REFUNDED";

  // Financial Calculations
  const isFree = course.pricingType === "FREE" || Number(course.price) === 0;
  const originalPrice = Number(course.price);
  const couponDiscount = appliedCoupon?.isValid ? appliedCoupon.discountAmount : 0;
  const priceAfterCoupon = Math.max(0, originalPrice - couponDiscount);
  const availableWalletBalance = wallet ? Number(wallet.balance) : 0;
  const walletDeduction = useWallet ? Math.min(availableWalletBalance, priceAfterCoupon) : 0;
  const finalPayable = Number((priceAfterCoupon - walletDeduction).toFixed(2));

  // Format Duration Helper
  const formatDuration = (seconds?: number) => {
    if (!seconds || seconds <= 0) return "Self-paced Live";
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${mins > 0 ? `${mins}m` : ""}`;
    return `${mins} mins`;
  };

  // Coupon Handlers
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setIsValidatingCoupon(true);
    setCouponError(null);
    try {
      const res = await couponApi.validateCoupon(couponCode.trim(), course.id);
      if (res.isValid) {
        setAppliedCoupon(res);
        setCouponError(null);
        toast.success(`Coupon '${res.code}' applied! Saved ₹${res.discountAmount.toFixed(2)}.`);
      } else {
        setAppliedCoupon(null);
        setCouponError(res.message || "Invalid coupon code for this course.");
      }
    } catch (err: any) {
      setAppliedCoupon(null);
      setCouponError(err?.message || "Failed to validate coupon");
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponError(null);
    toast.info("Coupon removed.");
  };

  // Razorpay Gateway Loader
  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if ((window as any).Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // Main Checkout Submission
  const handleCheckout = async () => {
    if (!currentUser) {
      toast.info("Please sign in or create an account to complete enrollment.");
      navigate(`/signin?redirect=/courses/${course.slug}/checkout`);
      return;
    }

    if (isRefundedEnrollment) {
      toast.error("You have previously refunded this course and are not eligible to re-enroll.");
      return;
    }

    setErrorMessage(null);
    setIsProcessing(true);

    try {
      // 1. Free Course Flow
      if (isFree) {
        await enrollFreeMutation.mutateAsync(course.id);
        navigate(`/courses/${course.slug}/checkout/success?type=free`);
        return;
      }

      // 2. 100% Wallet Payment Flow OR 100% Teacher Coupon Flow on Paid Course
      if (finalPayable === 0 && (walletDeduction > 0 || couponDiscount >= originalPrice)) {
        await payWithWalletMutation.mutateAsync({
          courseId: course.id,
          couponCode: appliedCoupon?.code,
        });
        navigate(
          `/courses/${course.slug}/checkout/success?type=wallet&amount=${walletDeduction > 0 ? walletDeduction : 0}${
            appliedCoupon?.code ? `&coupon=${appliedCoupon.code}` : ""
          }`
        );
        return;
      }

      // 3. Razorpay Gateway Flow
      const isScriptLoaded = await loadRazorpayScript();
      if (!isScriptLoaded) {
        throw new Error("Payment gateway SDK failed to load. Please check your internet connection.");
      }

      const orderResult = await createOrderMutation.mutateAsync({
        courseId: course.id,
        couponCode: appliedCoupon?.code,
        useWalletBalance: useWallet,
      });

      if (orderResult.isFullyPaidByWallet) {
        await payWithWalletMutation.mutateAsync({
          courseId: course.id,
          couponCode: appliedCoupon?.code,
        });
        navigate(
          `/courses/${course.slug}/checkout/success?type=wallet&amount=${walletDeduction > 0 ? walletDeduction : 0}${
            appliedCoupon?.code ? `&coupon=${appliedCoupon.code}` : ""
          }`
        );
        return;
      }

      const options = {
        key: orderResult.razorpayKeyId || (import.meta.env.VITE_RAZORPAY_KEY_ID as string) || "rzp_test_Tf1MqbTbYSx7uT",
        amount: Math.round(orderResult.finalPayableAmount * 100),
        currency: orderResult.currency || "INR",
        name: "Coursity Learning",
        description: `Live Cohort Enrollment: ${course.title}`,
        order_id: orderResult.orderId,
        prefill: {
          name: fullName || currentUser.name || "",
          email: email || currentUser.email || "",
          contact: phone || currentUser.phone || "",
        },
        theme: {
          color: "#F42A18",
        },
        handler: async (response: any) => {
          try {
            await verifyPaymentMutation.mutateAsync({
              courseId: course.id,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              couponCode: appliedCoupon?.code,
              walletDeductionAmount: walletDeduction,
            });
            navigate(
              `/courses/${course.slug}/checkout/success?type=razorpay&orderId=${response.razorpay_order_id}&paymentId=${response.razorpay_payment_id}&amount=${orderResult.finalPayableAmount}${
                appliedCoupon?.code ? `&coupon=${appliedCoupon.code}` : ""
              }`
            );
          } catch (verifyErr: any) {
            const failMsg = verifyErr?.message || "Payment verification failed. Please contact support.";
            navigate(`/courses/${course.slug}/checkout/failed?reason=${encodeURIComponent(failMsg)}`);
          } finally {
            setIsProcessing(false);
          }
        },
        modal: {
          ondismiss: () => {
            setIsProcessing(false);
          },
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on("payment.failed", (failRes: any) => {
        setIsProcessing(false);
        const failMsg = failRes?.error?.description || "Payment failed or was cancelled by your bank.";
        navigate(`/courses/${course.slug}/checkout/failed?reason=${encodeURIComponent(failMsg)}`);
      });
      rzp.open();
    } catch (err: any) {
      setIsProcessing(false);
      setErrorMessage(err?.message || "Failed to process enrollment");
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-8 min-h-screen">
      {/* 1. Breadcrumb Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs sm:text-sm text-neutral-500">
          <Link to="/" className="hover:text-[#F42A18] transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
          <Link to="/courses" className="hover:text-[#F42A18] transition-colors">
            Courses
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
          <Link to={`/courses/${course.slug}`} className="hover:text-[#F42A18] transition-colors truncate max-w-[200px] sm:max-w-xs">
            {course.title}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
          <span className="font-bold text-neutral-900 dark:text-white">
            Secure Checkout
          </span>
        </div>

        <Button
          asChild
          variant="outline"
          size="sm"
          className="rounded-xl text-xs border-neutral-200 dark:border-neutral-800 gap-1.5 cursor-pointer"
        >
          <Link to={`/courses/${course.slug}`}>
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Course Syllabus</span>
          </Link>
        </Button>
      </div>

      {/* 2. Top Banner if Refunded or Already Enrolled */}
      {isRefundedEnrollment && (
        <div className="p-5 rounded-3xl bg-amber-500/10 border border-amber-500/20 flex flex-col sm:flex-row items-center justify-between gap-4 text-amber-800 dark:text-amber-300">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-neutral-900 dark:text-white">Ineligible for Re-Enrollment</h4>
              <p className="text-xs text-neutral-600 dark:text-neutral-400">
                You previously claimed a 100% full money-back refund for this course under our 20-Day Guarantee. In accordance with platform terms, re-enrollment in previously refunded courses is not permitted.
              </p>
            </div>
          </div>
          <Button
            onClick={() => navigate("/courses")}
            variant="outline"
            className="rounded-xl text-xs font-bold border-amber-500/30 text-amber-700 dark:text-amber-300 hover:bg-amber-500/10 shrink-0 cursor-pointer"
          >
            <span>Explore Other Courses</span>
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      )}

      {existingEnrollment && (
        <div className="p-4 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 flex flex-col sm:flex-row items-center justify-between gap-4 text-emerald-800 dark:text-emerald-300">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
            <div>
              <h4 className="text-sm font-bold">You are already enrolled in this course!</h4>
              <p className="text-xs text-emerald-700 dark:text-emerald-400">
                Your seat is confirmed in this live batch. You have full access to all lectures and live classrooms.
              </p>
            </div>
          </div>
          <Button
            onClick={() => navigate(`/learn/${course.slug}`)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shrink-0 cursor-pointer shadow-md shadow-emerald-600/20"
          >
            <span>Enter Live Classroom</span>
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      )}

      {/* 3. Main 2-Column Checkout Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: Comprehensive Course Details & Guarantee & Billing Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Error Banner */}
          {errorMessage && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-600 dark:text-red-400 text-xs sm:text-sm flex items-start gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h5 className="font-bold">Checkout Notice</h5>
                <p className="text-xs leading-relaxed">{errorMessage}</p>
              </div>
            </div>
          )}

          {/* Course Details Card */}
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800/80 rounded-3xl p-6 sm:p-7 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row gap-5 items-start">
              <div className="relative w-full sm:w-44 aspect-video rounded-2xl overflow-hidden bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 shrink-0">
                {course.thumbnail ? (
                  <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-neutral-400">
                    <Video className="w-8 h-8" />
                  </div>
                )}
                <div className="absolute top-2 left-2">
                  <Badge className="bg-[#F42A18] text-white border-0 text-[10px] font-bold px-2 py-0.5">
                    LIVE COHORT
                  </Badge>
                </div>
              </div>

              <div className="flex-1 min-w-0 space-y-2.5">
                <div className="flex flex-wrap items-center gap-2">
                  {course.category && (
                    <Badge variant="outline" className="text-[11px] px-2.5 py-0.5 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
                      {course.category.name}
                    </Badge>
                  )}
                  <Badge variant="outline" className="text-[11px] px-2.5 py-0.5 bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20">
                    {course.level.replace("_", " ")}
                  </Badge>
                  <Badge variant="outline" className="text-[11px] px-2.5 py-0.5 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
                    {course.language}
                  </Badge>
                </div>

                <h2 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white leading-tight">
                  {course.title}
                </h2>

                {course.subtitle && (
                  <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed line-clamp-2">
                    {course.subtitle}
                  </p>
                )}
              </div>
            </div>

            {/* Instructor Details */}
            <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/70 border border-neutral-200/60 dark:border-neutral-800/60 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-neutral-200 dark:bg-neutral-700 overflow-hidden flex items-center justify-center shrink-0 border border-neutral-300 dark:border-neutral-600">
                  {teacherProfile?.profile?.avatar ? (
                    <img
                      src={teacherProfile.profile.avatar}
                      alt={instructor?.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-5 h-5 text-neutral-400" />
                  )}
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] uppercase font-bold text-neutral-400 block tracking-wider">
                    Instructor
                  </span>
                  <h4 className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-white truncate">
                    {instructor?.name || "Verified Coursity Instructor"}
                  </h4>
                  {teacherProfile?.expertise && teacherProfile.expertise.length > 0 && (
                    <p className="text-[11px] text-neutral-500 truncate">
                      {teacherProfile.expertise.join(", ")}
                    </p>
                  )}
                </div>
              </div>

              {course.startingDate && (
                <div className="text-right shrink-0">
                  <span className="text-[10px] uppercase font-bold text-neutral-400 block tracking-wider">
                    Batch Schedule
                  </span>
                  <span className="text-xs font-bold text-[#F42A18]">
                    {isStarted ? "In Progress" : new Date(course.startingDate).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>

            {/* Cohort Highlights Specs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-800/70 border border-neutral-200/50 dark:border-neutral-800/50 text-center">
                <Radio className="w-4 h-4 text-[#F42A18] mx-auto mb-1" />
                <span className="text-[10px] text-neutral-400 block">Class Format</span>
                <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200">Live Interactive</span>
              </div>
              <div className="p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-800/70 border border-neutral-200/50 dark:border-neutral-800/50 text-center">
                <BookOpen className="w-4 h-4 text-[#F42A18] mx-auto mb-1" />
                <span className="text-[10px] text-neutral-400 block">Curriculum</span>
                <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200">{course.totalLessons} Lectures</span>
              </div>
              <div className="p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-800/70 border border-neutral-200/50 dark:border-neutral-800/50 text-center">
                <Clock className="w-4 h-4 text-[#F42A18] mx-auto mb-1" />
                <span className="text-[10px] text-neutral-400 block">Total Duration</span>
                <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200">{formatDuration(course.totalDurationSeconds)}</span>
              </div>
              <div className="p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-800/70 border border-neutral-200/50 dark:border-neutral-800/50 text-center">
                <Award className="w-4 h-4 text-[#F42A18] mx-auto mb-1" />
                <span className="text-[10px] text-neutral-400 block">Certificate</span>
                <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200">Included</span>
              </div>
            </div>
          </div>

          {/* 100% Risk-Free 20-Day Refund Policy Banner */}
          <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent dark:from-emerald-950/40 dark:via-emerald-950/20 dark:to-transparent border border-emerald-500/30 dark:border-emerald-500/20 flex flex-col sm:flex-row items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div className="space-y-1.5 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-neutral-900 dark:text-white">
                  100% Risk-Free 20-Day Full Refund Guarantee
                </h3>
                <Badge className="bg-emerald-600 text-white text-[10px] font-bold">
                  Zero Hassle
                </Badge>
              </div>
              <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">
                Join the live cohort today completely risk-free. If you are not completely satisfied with the course, you can request a <strong>100% full money-back refund within 20 calendar days</strong> from course start or before <strong>4 live classes</strong> are conducted.
              </p>
              <div className="flex flex-wrap items-center gap-4 text-[11px] text-emerald-700 dark:text-emerald-400 pt-1 font-medium">
                <span>✓ Instant wallet credit or direct source reversal</span>
                <span>✓ Direct 1-click refund button inside classroom</span>
              </div>
            </div>
          </div>

          {/* Student Billing & Contact Information */}
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800/80 rounded-3xl p-6 sm:p-7 shadow-sm space-y-4">
            <h3 className="text-sm sm:text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
              <User className="w-4 h-4 text-[#F42A18]" />
              <span>Student Account & Contact Details</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <Input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Athul Raj"
                  className="rounded-xl text-xs h-10"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <Input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. student@example.com"
                  className="rounded-xl text-xs h-10"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Phone Number
                </label>
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="rounded-xl text-xs h-10"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Country
                </label>
                <Input
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="rounded-xl text-xs h-10"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Sticky Order Summary & Coupon Engine & Payment Action */}
        <div className="lg:col-span-1 sticky top-24 space-y-6">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800/80 rounded-3xl p-6 shadow-xl space-y-5">
            <h3 className="text-base font-bold text-neutral-900 dark:text-white pb-3 border-b border-neutral-100 dark:border-neutral-800">
              Order Summary
            </h3>

            {/* Price Badge */}
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-neutral-400 block tracking-wider">
                Total Tuition
              </span>
              {isFree ? (
                <div className="flex items-center gap-2">
                  <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                    FREE
                  </span>
                  <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-xs font-semibold">
                    100% Free Access
                  </Badge>
                </div>
              ) : (
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-neutral-900 dark:text-white font-mono">
                    ₹{finalPayable.toFixed(2)}
                  </span>
                  {couponDiscount > 0 && (
                    <span className="text-sm text-neutral-400 line-through font-mono">
                      ₹{originalPrice.toFixed(2)}
                    </span>
                  )}
                </div>
              )}
            </div>

            {!isFree && (
              <>
                {/* Teacher Promo Coupon Section */}
                <div className="space-y-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                    Have a Teacher Promo Coupon?
                  </label>

                  {appliedCoupon ? (
                    <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <div className="min-w-0">
                          <span className="font-mono font-bold text-xs text-emerald-700 dark:text-emerald-300 block truncate">
                            {appliedCoupon.code}
                          </span>
                          <span className="text-[11px] text-emerald-600 font-medium">
                            Saved ₹{couponDiscount.toFixed(2)}
                          </span>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleRemoveCoupon}
                        className="h-7 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/50 cursor-pointer shrink-0"
                      >
                        Remove
                      </Button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Tag className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                        <Input
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                          placeholder="e.g. INSTRUCTOR20"
                          className="pl-9 uppercase font-mono text-xs rounded-xl h-10"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleApplyCoupon}
                        disabled={!couponCode.trim() || isValidatingCoupon}
                        className="rounded-xl text-xs font-bold cursor-pointer shrink-0 h-10 px-4"
                      >
                        {isValidatingCoupon ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Apply"}
                      </Button>
                    </div>
                  )}

                  {couponError && (
                    <p className="text-[11px] text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      <span>{couponError}</span>
                    </p>
                  )}
                </div>

                {/* Wallet Balance Option */}
                {availableWalletBalance > 0 && priceAfterCoupon > 0 && (
                  <div className="p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-800/70 border border-neutral-200 dark:border-neutral-800 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                        <WalletIcon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-neutral-900 dark:text-white">
                          Use Coursity Wallet
                        </p>
                        <p className="text-[11px] text-neutral-500">
                          Balance: ₹{availableWalletBalance.toFixed(2)} (deduct ₹{walletDeduction.toFixed(2)})
                        </p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={useWallet}
                      onChange={(e) => setUseWallet(e.target.checked)}
                      className="w-4 h-4 accent-[#F42A18] rounded cursor-pointer shrink-0"
                    />
                  </div>
                )}

                {/* Price Breakdown Ledger */}
                <div className="space-y-2 pt-2 border-t border-neutral-100 dark:border-neutral-800 text-xs">
                  <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                    <span>Course Tuition</span>
                    <span className="font-mono">₹{originalPrice.toFixed(2)}</span>
                  </div>
                  {couponDiscount > 0 && (
                    <div className="flex justify-between text-emerald-600 font-semibold">
                      <span>Teacher Coupon ({appliedCoupon?.code})</span>
                      <span className="font-mono">-₹{couponDiscount.toFixed(2)}</span>
                    </div>
                  )}
                  {walletDeduction > 0 && (
                    <div className="flex justify-between text-emerald-600 font-semibold">
                      <span>Wallet Balance Applied</span>
                      <span className="font-mono">-₹{walletDeduction.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm font-black text-neutral-900 dark:text-white pt-2 border-t border-neutral-200 dark:border-neutral-800 font-mono">
                    <span>Total Payable</span>
                    <span>₹{finalPayable.toFixed(2)}</span>
                  </div>
                </div>
              </>
            )}

            {/* Primary Action Button */}
            <Button
              onClick={handleCheckout}
              disabled={isProcessing || isRefundedEnrollment}
              className={`w-full h-12 text-white font-bold text-sm rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 ${
                isRefundedEnrollment
                  ? "bg-neutral-400 dark:bg-neutral-700 text-neutral-200 cursor-not-allowed shadow-none"
                  : "bg-[#F42A18] hover:bg-[#D92212] shadow-[#F42A18]/25 cursor-pointer"
              }`}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Confirming Enrollment...</span>
                </>
              ) : isRefundedEnrollment ? (
                <>
                  <ShieldAlert className="w-4 h-4" />
                  <span>Ineligible to Enroll (Refunded)</span>
                </>
              ) : isFree ? (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Enroll for Free & Enter Classroom</span>
                </>
              ) : finalPayable === 0 ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Complete Enrollment (₹0.00)</span>
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4" />
                  <span>Pay ₹{finalPayable.toFixed(2)} & Join Live Batch</span>
                </>
              )}
            </Button>

            {/* Wishlist Button */}
            <WishlistButton courseId={course.id} variant="button" />

            {/* Trust Assurances */}
            <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 space-y-2 text-[11px] text-neutral-500 dark:text-neutral-400">
              <div className="flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                <span>256-bit encrypted checkout via Razorpay</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span className="text-emerald-700 dark:text-emerald-400 font-medium">
                  20-day / 4-classes 100% money-back guarantee
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                <span>Instant confirmation with GST invoice</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseCheckoutPage;
