import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  usePlans,
  useCreateRazorpayOrder,
  useVerifyRazorpayPayment,
  useSubscribePlan,
} from "../hooks/usePlans";
import {
  calculatePlanCheckoutPrice,
  DEFAULT_GST_PERCENT,
} from "../constants/billing.constants";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { ActiveOfferBanner } from "@/features/offers/components/ActiveOfferBanner";
import { usePlanOffer } from "@/features/offers/hooks/useOffers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Lock,
  ArrowLeft,
  CreditCard,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Receipt,
  ShieldAlert,
  Tag,
} from "lucide-react";

export const TeacherPlanCheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const planId = searchParams.get("planId");
  const cycleParam = searchParams.get("cycle") as "MONTHLY" | "YEARLY" | null;
  const billingCycle = cycleParam === "YEARLY" ? "YEARLY" : "MONTHLY";

  const { data: plansData, isLoading: isPlansLoading } = usePlans();
  const { data: currentUser } = useCurrentUser();

  const createOrderMutation = useCreateRazorpayOrder();
  const verifyPaymentMutation = useVerifyRazorpayPayment();
  const subscribeFreeMutation = useSubscribePlan();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [stateName, setStateName] = useState("Karnataka");
  const [country, setCountry] = useState("India");
  const [gstin, setGstin] = useState("");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
  }>({
    isOpen: false,
    title: "",
    description: "",
  });

  useEffect(() => {
    if (currentUser) {
      if (currentUser.name && !fullName) setFullName(currentUser.name);
      if (currentUser.email && !email) setEmail(currentUser.email);
    }
  }, [currentUser]);

  const plans = plansData?.plans || [];
  const plan = plans.find((p) => p.id === planId) || plans[0];

  // Fetch automatic best default promotional offer for this plan & billing cycle
  const { data: planOffer, isLoading: isPlanOfferLoading } = usePlanOffer(
    plan?.id,
    billingCycle
  );

  if (isPlansLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[350px] gap-3 w-full">
        <Loader2 className="w-8 h-8 text-[#F42A18] animate-spin" />
        <p className="text-xs font-medium text-neutral-500">Preparing checkout session...</p>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="p-6 text-center space-y-3">
        <AlertCircle className="w-8 h-8 mx-auto text-red-500" />
        <p className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
          Selected plan not found.
        </p>
        <Button asChild variant="outline" size="sm" className="h-8 text-xs">
          <Link to="/teachers/plans/browse">Return to Plans Catalog</Link>
        </Button>
      </div>
    );
  }

  const isFree = plan.price === 0;
  const standardPricing = calculatePlanCheckoutPrice(plan.price, billingCycle, DEFAULT_GST_PERCENT);
  const basePrice = standardPricing.basePrice;

  // Compute pricing directly from automatic plan offer result or standard pricing
  const hasOffer = !isFree && Boolean(planOffer?.hasOffer);
  const discountAmount = hasOffer ? (planOffer?.discountAmount ?? 0) : 0;
  const discountedBasePrice = hasOffer ? (planOffer?.discountedBasePrice ?? basePrice) : basePrice;
  const gstPercent = hasOffer ? (planOffer?.gstPercent ?? DEFAULT_GST_PERCENT) : DEFAULT_GST_PERCENT;
  const taxAmount = hasOffer ? (planOffer?.taxAmount ?? standardPricing.taxAmount) : standardPricing.taxAmount;
  const totalAmount = hasOffer ? (planOffer?.totalAmount ?? standardPricing.totalAmount) : standardPricing.totalAmount;
  const totalSavings = hasOffer ? (planOffer?.savings ?? 0) : 0;
  const appliedOfferId = hasOffer ? planOffer?.offerId : undefined;

  // Custom Form Validation
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!fullName.trim()) {
      newErrors.fullName = "Full Name is required";
    } else if (fullName.trim().length < 2) {
      newErrors.fullName = "Name must be at least 2 characters";
    }

    if (!email.trim()) {
      newErrors.email = "Email address is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!isFree) {
      const cleanPhone = phone.replace(/[\s-]/g, "");
      if (!cleanPhone) {
        newErrors.phone = "Phone number is required for SMS/UPI verification";
      } else if (!/^\+?[0-9]{10,14}$/.test(cleanPhone)) {
        newErrors.phone = "Please enter a valid 10-digit mobile number";
      }

      if (!stateName.trim()) {
        newErrors.stateName = "State / Province is required for GST invoicing";
      }

      if (!country.trim()) {
        newErrors.country = "Country is required";
      }

      if (gstin.trim() && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/i.test(gstin.trim())) {
        newErrors.gstin = "Invalid 15-digit GSTIN format (e.g. 29ABCDE1234F1Z5)";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if ((window as any).Razorpay) return resolve(true);
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleFreeActivation = async () => {
    if (!validateForm()) return;
    try {
      setIsProcessing(true);
      await subscribeFreeMutation.mutateAsync({ planId: plan.id });
      navigate(`/teachers/plans/success?planId=${plan.id}&amount=0`);
    } catch {
      // Toast error handled
    } finally {
      setIsProcessing(false);
    }
  };

  const handleProceedToPayment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (isFree) {
      return handleFreeActivation();
    }

    try {
      setIsProcessing(true);

      // 1. Initialize Order on Backend with resolved default offer ID
      const orderRes = await createOrderMutation.mutateAsync({
        planId: plan.id,
        billingCycle,
        userName: fullName.trim() || undefined,
        userEmail: email.trim() || undefined,
        phone: phone.trim(),
        state: stateName.trim(),
        country: country.trim(),
        gstin: gstin.trim() || undefined,
        offerId: appliedOfferId,
      });

      // 2. Load and Open Live Razorpay Modal
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded || !(window as any).Razorpay) {
        setModalState({
          isOpen: true,
          title: "Payment Gateway Offline",
          description: "Unable to load Razorpay checkout secure modal. Please check your internet connection.",
        });
        setIsProcessing(false);
        return;
      }

      const chargeAmount = orderRes.amount || totalAmount;

      const options = {
        key: orderRes.keyId,
        amount: Math.round(chargeAmount * 100),
        currency: orderRes.currency || "INR",
        name: "Coursity",
        description: hasOffer && planOffer?.title
          ? `${plan.name} (${billingCycle}) - ${planOffer.title}`
          : `${plan.name} (${billingCycle}) Subscription`,
        image: "/favicon.ico",
        order_id: orderRes.orderId,
        prefill: {
          name: fullName.trim() || orderRes.userName || "Instructor",
          email: email.trim() || orderRes.userEmail || "",
          contact: phone.trim(),
        },
        theme: {
          color: "#F42A18",
        },
        notes: {
          planId: plan.id,
          billingCycle,
          offerId: appliedOfferId || "",
        },
        handler: async (response: any) => {
          try {
            await verifyPaymentMutation.mutateAsync({
              orderId: response.razorpay_order_id,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
              planId: plan.id,
              billingCycle,
              userName: fullName.trim() || undefined,
              userEmail: email.trim() || undefined,
              phone: phone.trim(),
              state: stateName.trim(),
              country: country.trim(),
              gstin: gstin.trim() || undefined,
              offerId: appliedOfferId,
            });

            navigate(
              `/teachers/plans/success?planId=${plan.id}&paymentId=${response.razorpay_payment_id}&orderId=${response.razorpay_order_id}&amount=${chargeAmount}`
            );
          } catch (err: any) {
            setModalState({
              isOpen: true,
              title: "Payment Verification Failed",
              description:
                err?.message ||
                "Payment was received by Razorpay but verification failed. Our billing team will synchronize your subscription within 15 minutes.",
            });
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
      rzp.on("payment.failed", (response: any) => {
        setIsProcessing(false);
        setModalState({
          isOpen: true,
          title: "Payment Declined",
          description:
            response.error?.description ||
            "Your transaction could not be processed. Please check your card balance or try another UPI/Card method.",
        });
      });

      rzp.open();
    } catch (err: any) {
      setIsProcessing(false);
      setModalState({
        isOpen: true,
        title: "Order Generation Failed",
        description:
          err?.message || "Failed to initialize payment gateway order. Please retry or contact support.",
      });
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-4 pb-12">
      {/* Back Link */}
      <Link
        to="/teachers/plans/browse"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to Plan Selection
      </Link>

      {/* Main Checkout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Billing Details Form */}
        <div className="lg:col-span-7 bg-white dark:bg-neutral-900/60 border border-neutral-200/80 dark:border-neutral-800 rounded-3xl p-5 sm:p-6 shadow-xs space-y-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-xl bg-[#F42A18]/10 text-[#F42A18]">
                <CreditCard className="w-4 h-4" />
              </span>
              <h2 className="text-base font-bold text-neutral-900 dark:text-white">
                Billing & Contact Information
              </h2>
            </div>
            <p className="text-xs text-neutral-500 mt-1">
              {isFree
                ? "Confirm your details to activate your Free Tier workspace instantly."
                : "Tax invoices and payment receipts will be generated with these details."}
            </p>
          </div>

          <form onSubmit={handleProceedToPayment} className="space-y-4">
            {/* Full Name */}
            <div className="space-y-1">
              <Label className="text-xs font-semibold">
                Full Name / Business Name <span className="text-red-500">*</span>
              </Label>
              <Input
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  if (errors.fullName) setErrors((prev) => ({ ...prev, fullName: "" }));
                }}
                placeholder="e.g. John Doe / Tech Academy"
                className={`h-9 text-xs rounded-xl ${errors.fullName ? "border-red-500" : ""}`}
              />
              {errors.fullName && <p className="text-[11px] text-red-500 font-medium">{errors.fullName}</p>}
            </div>

            {/* Email Address */}
            <div className="space-y-1">
              <Label className="text-xs font-semibold">
                Email Address (Receipts Sent Here) <span className="text-red-500">*</span>
              </Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors((prev) => ({ ...prev, email: "" }));
                }}
                placeholder="e.g. john@coursity.io"
                className={`h-9 text-xs rounded-xl ${errors.email ? "border-red-500" : ""}`}
              />
              {errors.email && <p className="text-[11px] text-red-500 font-medium">{errors.email}</p>}
            </div>

            {!isFree && (
              <>
                {/* Phone Number */}
                <div className="space-y-1">
                  <Label className="text-xs font-semibold">
                    Mobile Number (For UPI / SMS Invoices) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="tel"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      if (errors.phone) setErrors((prev) => ({ ...prev, phone: "" }));
                    }}
                    placeholder="e.g. 9876543210"
                    className={`h-9 text-xs rounded-xl ${errors.phone ? "border-red-500" : ""}`}
                  />
                  {errors.phone && <p className="text-[11px] text-red-500 font-medium">{errors.phone}</p>}
                </div>

                {/* State & Country */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">
                      State / Province <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      value={stateName}
                      onChange={(e) => {
                        setStateName(e.target.value);
                        if (errors.stateName) setErrors((prev) => ({ ...prev, stateName: "" }));
                      }}
                      placeholder="e.g. Karnataka"
                      className={`h-9 text-xs rounded-xl ${errors.stateName ? "border-red-500" : ""}`}
                    />
                    {errors.stateName && (
                      <p className="text-[11px] text-red-500 font-medium">{errors.stateName}</p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">
                      Country <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      value={country}
                      onChange={(e) => {
                        setCountry(e.target.value);
                        if (errors.country) setErrors((prev) => ({ ...prev, country: "" }));
                      }}
                      placeholder="e.g. India"
                      className={`h-9 text-xs rounded-xl ${errors.country ? "border-red-500" : ""}`}
                    />
                    {errors.country && (
                      <p className="text-[11px] text-red-500 font-medium">{errors.country}</p>
                    )}
                  </div>
                </div>

                {/* Optional GSTIN */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-semibold">GSTIN (Optional Business Tax ID)</Label>
                    <span className="text-[10px] text-neutral-400">For 18% Input Tax Credit</span>
                  </div>
                  <Input
                    value={gstin}
                    onChange={(e) => {
                      setGstin(e.target.value.toUpperCase());
                      if (errors.gstin) setErrors((prev) => ({ ...prev, gstin: "" }));
                    }}
                    placeholder="e.g. 29ABCDE1234F1Z5"
                    className={`h-9 text-xs rounded-xl font-mono uppercase ${
                      errors.gstin ? "border-red-500" : ""
                    }`}
                  />
                  {errors.gstin && <p className="text-[11px] text-red-500 font-medium">{errors.gstin}</p>}
                </div>
              </>
            )}

            {/* Submission Action */}
            <div className="pt-2">
              <Button
                type="submit"
                disabled={isProcessing || createOrderMutation.isPending || isPlanOfferLoading}
                className="w-full h-11 rounded-2xl bg-[#F42A18] hover:bg-[#d02010] text-white font-bold text-xs shadow-md shadow-[#F42A18]/20 flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
              >
                {isProcessing || createOrderMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Preparing Secure Payment Gateway...</span>
                  </>
                ) : isFree ? (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Activate Free Membership Now</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>
                      Pay ₹{totalAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })} with Razorpay
                    </span>
                  </>
                )}
              </Button>

              <div className="flex items-center justify-center gap-3 mt-3 text-[11px] text-neutral-400">
                <span className="flex items-center gap-1">
                  <Lock className="w-3 h-3 text-emerald-500" /> 256-Bit SSL Encrypted
                </span>
                <span>•</span>
                <span>Instant Activation</span>
                <span>•</span>
                <span>UPI, Cards & NetBanking</span>
              </div>
            </div>
          </form>
        </div>

        {/* Right Column: Plan Summary & Price Breakdown */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white dark:bg-neutral-900/60 border border-neutral-200/80 dark:border-neutral-800 rounded-3xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                <Receipt className="w-3.5 h-3.5 text-[#F42A18]" />
                Order Summary
              </span>
              <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-wider">
                {billingCycle}
              </Badge>
            </div>

            {/* Plan Info Card */}
            <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-100 dark:border-neutral-800/80 space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                  {plan.name} Tier
                </h3>
                <span className="text-xs font-bold text-[#F42A18]">
                  {isFree ? "Free" : `₹${basePrice.toLocaleString()}`}
                </span>
              </div>
              <p className="text-[11px] text-neutral-500 leading-snug line-clamp-2">
                {plan.tagline || "Full access to live classes, AI evaluations, and cloud recording storage."}
              </p>

              {billingCycle === "YEARLY" && !isFree && (
                <div className="pt-0.5">
                  <span className="text-[9px] bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold px-1.5 py-0.5 rounded">
                    20% Annual Discount Applied
                  </span>
                </div>
              )}
            </div>

            {/* Automatic Active Offer Banner (Only for paid plans with active promotional offers) */}
            {!isFree && (
              <ActiveOfferBanner planOffer={planOffer} />
            )}

            {/* Key Inclusions (Compact) */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                Plan Inclusions:
              </span>
              <ul className="space-y-1 text-[11px] text-neutral-600 dark:text-neutral-300">
                {plan.features?.slice(0, 3).map((pf) => (
                  <li key={pf.id} className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                    <span className="truncate">
                      {pf.feature?.name}:{" "}
                      <strong>
                        {pf.isUnlimited || pf.value === "-1"
                          ? "Unlimited"
                          : pf.feature?.featureType === "BOOLEAN"
                          ? "Included"
                          : `${pf.value} ${pf.feature?.unit || ""}`}
                      </strong>
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Price Calculations (Compact) */}
            <div className="space-y-1.5 pt-2 border-t border-neutral-100 dark:border-neutral-800 text-xs">
              <div className="flex items-center justify-between text-neutral-600 dark:text-neutral-400">
                <span>Base Price ({billingCycle.toLowerCase()})</span>
                <span className="font-semibold text-neutral-900 dark:text-white">
                  ₹{basePrice.toFixed(2)}
                </span>
              </div>

              {/* Applied Discount Line */}
              {hasOffer && (
                <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
                  <span className="flex items-center gap-1 text-[11px]">
                    <Tag className="w-3 h-3" />
                    Discount ({planOffer?.title || "Promotional Offer"})
                  </span>
                  <span className="font-bold">
                    -₹{discountAmount.toFixed(2)}
                  </span>
                </div>
              )}

              {hasOffer && (
                <div className="flex items-center justify-between text-neutral-600 dark:text-neutral-400">
                  <span>Discounted Subtotal</span>
                  <span className="font-semibold text-neutral-900 dark:text-white">
                    ₹{discountedBasePrice.toFixed(2)}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between text-neutral-600 dark:text-neutral-400">
                <span>GST ({gstPercent}%)</span>
                <span className="font-semibold text-neutral-900 dark:text-white">
                  ₹{taxAmount.toFixed(2)}
                </span>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-neutral-200/80 dark:border-neutral-800 text-sm font-bold">
                <div>
                  <span className="text-neutral-900 dark:text-white">Total Payable</span>
                  {totalSavings > 0 && (
                    <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                      You save ₹{totalSavings.toFixed(2)}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  {hasOffer && (
                    <span className="text-[11px] text-neutral-400 line-through mr-1.5 font-normal">
                      ₹{standardPricing.totalAmount.toFixed(2)}
                    </span>
                  )}
                  <span className="text-[#F42A18]">
                    ₹{totalAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Error / Gateway Notice Modal */}
      {modalState.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-sm p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xl space-y-4 text-center">
            <div className="space-y-3">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                {modalState.title}
              </h3>
              <p className="text-xs text-neutral-500 leading-relaxed">
                {modalState.description}
              </p>
              <Button
                onClick={() => setModalState((prev) => ({ ...prev, isOpen: false }))}
                size="sm"
                className="w-full rounded-xl text-xs bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 cursor-pointer"
              >
                Dismiss
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherPlanCheckoutPage;
