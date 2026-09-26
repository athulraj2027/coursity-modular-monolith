import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ModalTemplate } from "@/components/common/ModalTemplate";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  ShieldCheck,
  Tag,
  Wallet as WalletIcon,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Clock,
  Video,
  Loader2,
} from "lucide-react";
import {
  useEnrollFreeCourse,
  useCreateCourseOrder,
  useVerifyCoursePayment,
  usePayWithWallet,
} from "../hooks/use-enrollment";
import { useMyWallet } from "@/features/wallet/hooks/useWallet";
import { couponApi } from "@/features/coupons/api/coupon.api";
import { useCurrentUser } from "@/features/auth";
import type { CouponValidationResult } from "@/features/coupons/types/coupon.types";

interface CourseCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: {
    id: string;
    title: string;
    slug: string;
    thumbnail?: string | null;
    price: number;
    pricingType: "FREE" | "PAID";
    currency?: string;
    startingDate?: string | null;
    teacherName?: string;
  };
}

export function CourseCheckoutModal({
  isOpen,
  onClose,
  course,
}: CourseCheckoutModalProps) {
  const navigate = useNavigate();
  const { data: user } = useCurrentUser();
  const { data: wallet } = useMyWallet();

  const enrollFreeMutation = useEnrollFreeCourse();
  const createOrderMutation = useCreateCourseOrder();
  const verifyPaymentMutation = useVerifyCoursePayment();
  const payWithWalletMutation = usePayWithWallet();

  const [couponCode, setCouponCode] = useState("");
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<CouponValidationResult | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [useWallet, setUseWallet] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isFree = course.pricingType === "FREE" || Number(course.price) === 0;
  const originalPrice = Number(course.price);
  const couponDiscount = appliedCoupon?.isValid ? appliedCoupon.discountAmount : 0;
  const priceAfterCoupon = Math.max(0, originalPrice - couponDiscount);
  const availableWalletBalance = wallet ? Number(wallet.balance) : 0;
  const walletDeduction = useWallet ? Math.min(availableWalletBalance, priceAfterCoupon) : 0;
  const finalPayable = Number((priceAfterCoupon - walletDeduction).toFixed(2));

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setIsValidatingCoupon(true);
    setCouponError(null);
    try {
      const res = await couponApi.validateCoupon(couponCode.trim(), course.id);
      if (res.isValid) {
        setAppliedCoupon(res);
        setCouponError(null);
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
  };

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

  const handleCheckout = async () => {
    setErrorMessage(null);
    setIsProcessing(true);

    try {
      // 1. Free Course Flow
      if (isFree) {
        await enrollFreeMutation.mutateAsync(course.id);
        onClose();
        navigate(`/courses/${course.slug}/checkout/success?type=free`);
        return;
      }

      // 2. 100% Wallet Payment Flow or 100% Coupon Flow on Paid Course
      if (finalPayable === 0 && (walletDeduction > 0 || couponDiscount >= originalPrice)) {
        await payWithWalletMutation.mutateAsync({
          courseId: course.id,
          couponCode: appliedCoupon?.code,
        });
        onClose();
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
        throw new Error("Payment gateway SDK failed to load. Please check your connection.");
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
        onClose();
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
        description: `Enrollment in ${course.title}`,
        order_id: orderResult.orderId,
        prefill: {
          name: user?.name || "",
          email: user?.email || "",
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
            onClose();
            navigate(
              `/courses/${course.slug}/checkout/success?type=razorpay&orderId=${response.razorpay_order_id}&paymentId=${response.razorpay_payment_id}&amount=${orderResult.finalPayableAmount}${
                appliedCoupon?.code ? `&coupon=${appliedCoupon.code}` : ""
              }`
            );
          } catch (verifyErr: any) {
            onClose();
            const failMsg = verifyErr?.message || "Payment verification failed.";
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
        onClose();
        const failMsg = failRes?.error?.description || "Payment failed. Please retry.";
        navigate(`/courses/${course.slug}/checkout/failed?reason=${encodeURIComponent(failMsg)}`);
      });
      rzp.open();
    } catch (err: any) {
      setIsProcessing(false);
      setErrorMessage(err?.message || "Failed to process enrollment");
    }
  };

  return (
    <ModalTemplate
      isOpen={isOpen}
      onClose={onClose}
      title="Course Enrollment Checkout"
      maxWidth="md"
    >
      <div className="space-y-5 pt-2">
        {errorMessage && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Course Summary Card */}
        <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/70 border border-neutral-200/80 dark:border-neutral-800/80 space-y-2">
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#F42A18]">
                Live Batch Cohort
              </span>
              <h4 className="text-sm font-bold text-neutral-900 dark:text-white line-clamp-1">
                {course.title}
              </h4>
              {course.teacherName && (
                <p className="text-xs text-neutral-500">Instructor: {course.teacherName}</p>
              )}
            </div>
            <div className="text-right">
              {isFree ? (
                <span className="text-base font-black text-emerald-600 font-mono">FREE</span>
              ) : (
                <span className="text-base font-black text-neutral-900 dark:text-white font-mono">
                  ₹{originalPrice.toFixed(2)}
                </span>
              )}
            </div>
          </div>

          {course.startingDate && (
            <div className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 pt-1 border-t border-neutral-200/50 dark:border-neutral-800/50">
              <Clock className="w-3.5 h-3.5" />
              <span>
                Live Sessions Begin: {new Date(course.startingDate).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>

        {/* 20-Day / 4-Classes Guarantee Badge */}
        <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-start gap-2.5 text-emerald-800 dark:text-emerald-300">
          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <h5 className="text-xs font-bold">100% Risk-Free 20-Day Refund Policy</h5>
            <p className="text-[11px] leading-relaxed text-emerald-700 dark:text-emerald-400">
              Full money-back refund within <strong>20 days</strong> of course start or before <strong>4 live classes</strong> are conducted. Zero hassle.
            </p>
          </div>
        </div>

        {!isFree && (
          <>
            {/* Teacher Coupon Promo Section */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Have a Teacher Promo Coupon?
              </label>

              {appliedCoupon ? (
                <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/30">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <div>
                      <span className="font-mono font-bold text-xs text-emerald-700 dark:text-emerald-300">
                        {appliedCoupon.code}
                      </span>
                      <p className="text-[11px] text-emerald-600">
                        {appliedCoupon.message}
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleRemoveCoupon}
                    className="h-7 text-xs text-red-600 hover:text-red-700 cursor-pointer"
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
                      placeholder="e.g. REACT20"
                      className="pl-9 uppercase font-mono text-xs rounded-xl"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleApplyCoupon}
                    disabled={!couponCode.trim() || isValidatingCoupon}
                    className="rounded-xl text-xs font-bold cursor-pointer shrink-0"
                  >
                    {isValidatingCoupon ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Apply"}
                  </Button>
                </div>
              )}

              {couponError && (
                <p className="text-[11px] text-red-500 flex items-center gap-1 pt-0.5">
                  <AlertCircle className="w-3 h-3" />
                  <span>{couponError}</span>
                </p>
              )}
            </div>

            {/* Wallet Balance Deduction Option */}
            {availableWalletBalance > 0 && priceAfterCoupon > 0 && (
              <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/70 border border-neutral-200 dark:border-neutral-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                    <WalletIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-neutral-900 dark:text-white">
                      Apply Wallet Balance
                    </p>
                    <p className="text-[11px] text-neutral-500">
                      Available: ₹{availableWalletBalance.toFixed(2)} (deducting ₹{walletDeduction.toFixed(2)})
                    </p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={useWallet}
                  onChange={(e) => setUseWallet(e.target.checked)}
                  className="w-4 h-4 accent-[#F42A18] rounded cursor-pointer"
                />
              </div>
            )}

            {/* Price Breakdown */}
            <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/70 border border-neutral-200/80 dark:border-neutral-800/80 space-y-2 text-xs">
              <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                <span>Course Tuition</span>
                <span>₹{originalPrice.toFixed(2)}</span>
              </div>
              {couponDiscount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Teacher Coupon ({appliedCoupon?.code})</span>
                  <span>-₹{couponDiscount.toFixed(2)}</span>
                </div>
              )}
              {walletDeduction > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Wallet Balance Applied</span>
                  <span>-₹{walletDeduction.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-black text-neutral-900 dark:text-white pt-2 border-t border-neutral-200 dark:border-neutral-800 font-mono">
                <span>Total Payable</span>
                <span>₹{finalPayable.toFixed(2)}</span>
              </div>
            </div>
          </>
        )}

        {/* Action Button */}
        <Button
          onClick={handleCheckout}
          disabled={isProcessing}
          className="w-full h-12 bg-[#F42A18] hover:bg-[#D92212] text-white font-bold text-sm rounded-2xl shadow-lg shadow-[#F42A18]/25 transition-all cursor-pointer flex items-center justify-center gap-2"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Processing Enrollment...</span>
            </>
          ) : isFree ? (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Enroll for Free</span>
            </>
          ) : finalPayable === 0 ? (
            <>
              <WalletIcon className="w-4 h-4" />
              <span>Complete Enrollment (₹0 Payable)</span>
            </>
          ) : (
            <>
              <CreditCard className="w-4 h-4" />
              <span>Pay ₹{finalPayable.toFixed(2)} & Join Live Batch</span>
            </>
          )}
        </Button>
      </div>
    </ModalTemplate>
  );
}
