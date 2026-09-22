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
  const pricing = calculatePlanCheckoutPrice(plan.price, billingCycle, DEFAULT_GST_PERCENT);
  const basePrice = pricing.basePrice;
  const taxAmount = pricing.taxAmount;
  const totalAmount = pricing.totalAmount;

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

      // 1. Initialize Order on Backend
      const orderRes = await createOrderMutation.mutateAsync({
        planId: plan.id,
        billingCycle,
        userName: fullName.trim() || undefined,
        userEmail: email.trim() || undefined,
        phone: phone.trim(),
        state: stateName.trim(),
        country: country.trim(),
        gstin: gstin.trim() || undefined,
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
        description: `${plan.name} (${billingCycle}) Subscription`,
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
            });

            navigate(
              `/teachers/plans/success?orderId=${response.razorpay_order_id}&paymentId=${response.razorpay_payment_id}&planId=${plan.id}&amount=${chargeAmount}`
            );
          } catch (err: any) {
            navigate(
              `/teachers/plans/failed?reason=${encodeURIComponent(
                err.message || "Signature verification failed"
              )}&planId=${plan.id}`
            );
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

      const razorpayInstance = new (window as any).Razorpay(options);

      razorpayInstance.on("payment.failed", (response: any) => {
        setIsProcessing(false);
        navigate(
          `/teachers/plans/failed?reason=${encodeURIComponent(
            response.error?.description || "Payment was declined by your bank."
          )}&planId=${plan.id}`
        );
      });

      razorpayInstance.open();
    } catch (err: any) {
      setIsProcessing(false);
      setModalState({
        isOpen: true,
        title: "Order Creation Failed",
        description: err.message || "Unable to initiate payment transaction with the server.",
      });
    }
  };

  return (
    <div className="flex flex-1 flex-col w-full text-left max-w-5xl mx-auto space-y-3 pb-2 pt-1">
      {/* 1. Header & Back Link (Compact) */}
      <div className="flex items-center justify-between pb-2 border-b border-neutral-200/80 dark:border-neutral-800">
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="gap-1.5 text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-white rounded-lg h-7 px-2 cursor-pointer"
        >
          <Link to="/teachers/plans/browse">
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Plans
          </Link>
        </Button>

        <div className="flex items-center gap-1.5 text-[11px] text-neutral-500 font-medium">
          <Lock className="w-3 h-3 text-emerald-600" />
          <span>SSL 256-bit Encrypted Checkout</span>
        </div>
      </div>

      {/* 2. Form & Summary Grid (Fits neatly on laptop viewports) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Billing Details (Outer div removed, sits directly on layout) */}
        <div className="lg:col-span-7 space-y-3">
          <div className="space-y-0.5">
            <h1 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white">
              Billing Information
            </h1>
            <p className="text-[11px] text-neutral-500">
              Provide invoice and payment details to activate your instructor subscription.
            </p>
          </div>

          <form onSubmit={handleProceedToPayment} noValidate className="space-y-3">
            {/* Full Name & Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="name" className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300">
                  Full Name / Organization <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    if (errors.fullName) setErrors((prev) => ({ ...prev, fullName: "" }));
                  }}
                  placeholder="e.g. Sarah Jenkins"
                  className={`h-8.5 text-xs rounded-lg bg-neutral-50/50 dark:bg-neutral-800/50 ${
                    errors.fullName ? "border-red-500 ring-1 ring-red-500/20" : ""
                  }`}
                />
                {errors.fullName && (
                  <p className="text-[10px] text-red-500 font-medium">{errors.fullName}</p>
                )}
              </div>

              <div className="space-y-1">
                <Label htmlFor="email" className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300">
                  Email Address <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors((prev) => ({ ...prev, email: "" }));
                  }}
                  placeholder="sarah@example.com"
                  className={`h-8.5 text-xs rounded-lg bg-neutral-50/50 dark:bg-neutral-800/50 ${
                    errors.email ? "border-red-500 ring-1 ring-red-500/20" : ""
                  }`}
                />
                {errors.email && (
                  <p className="text-[10px] text-red-500 font-medium">{errors.email}</p>
                )}
              </div>
            </div>

            {/* Phone & State */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="phone" className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300">
                  Phone Number <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    if (errors.phone) setErrors((prev) => ({ ...prev, phone: "" }));
                  }}
                  placeholder="+91 98765 43210"
                  className={`h-8.5 text-xs rounded-lg bg-neutral-50/50 dark:bg-neutral-800/50 ${
                    errors.phone ? "border-red-500 ring-1 ring-red-500/20" : ""
                  }`}
                />
                {errors.phone ? (
                  <p className="text-[10px] text-red-500 font-medium">{errors.phone}</p>
                ) : (
                  <p className="text-[10px] text-neutral-400">Required for UPI payments and SMS receipt.</p>
                )}
              </div>

              <div className="space-y-1">
                <Label htmlFor="state" className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300">
                  State / Province <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="state"
                  value={stateName}
                  onChange={(e) => {
                    setStateName(e.target.value);
                    if (errors.stateName) setErrors((prev) => ({ ...prev, stateName: "" }));
                  }}
                  placeholder="e.g. Karnataka, Maharashtra"
                  className={`h-8.5 text-xs rounded-lg bg-neutral-50/50 dark:bg-neutral-800/50 ${
                    errors.stateName ? "border-red-500 ring-1 ring-red-500/20" : ""
                  }`}
                />
                {errors.stateName && (
                  <p className="text-[10px] text-red-500 font-medium">{errors.stateName}</p>
                )}
              </div>
            </div>

            {/* Country & GSTIN */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="country" className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300">
                  Country <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="country"
                  value={country}
                  onChange={(e) => {
                    setCountry(e.target.value);
                    if (errors.country) setErrors((prev) => ({ ...prev, country: "" }));
                  }}
                  placeholder="India"
                  className={`h-8.5 text-xs rounded-lg bg-neutral-50/50 dark:bg-neutral-800/50 ${
                    errors.country ? "border-red-500 ring-1 ring-red-500/20" : ""
                  }`}
                />
                {errors.country && (
                  <p className="text-[10px] text-red-500 font-medium">{errors.country}</p>
                )}
              </div>

              <div className="space-y-1">
                <Label htmlFor="gstin" className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300">
                  GSTIN <span className="text-neutral-400 font-normal">(Optional for B2B)</span>
                </Label>
                <Input
                  id="gstin"
                  value={gstin}
                  onChange={(e) => {
                    setGstin(e.target.value.toUpperCase());
                    if (errors.gstin) setErrors((prev) => ({ ...prev, gstin: "" }));
                  }}
                  placeholder="29ABCDE1234F1Z5"
                  className={`h-8.5 text-xs uppercase font-mono rounded-lg bg-neutral-50/50 dark:bg-neutral-800/50 ${
                    errors.gstin ? "border-red-500 ring-1 ring-red-500/20" : ""
                  }`}
                />
                {errors.gstin && (
                  <p className="text-[10px] text-red-500 font-medium">{errors.gstin}</p>
                )}
              </div>
            </div>

            {/* Payment Button */}
            <div className="pt-2">
              <Button
                type="submit"
                disabled={isProcessing}
                className="w-full h-10 rounded-xl text-xs font-bold bg-[#F42A18] hover:bg-[#d92212] text-white shadow-md shadow-[#F42A18]/20 cursor-pointer flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Securing Order & Opening Gateway...</span>
                  </>
                ) : isFree ? (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Activate Free Starter Tier (₹0)</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>
                      Proceed to Pay ₹{totalAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </span>
                  </>
                )}
              </Button>
            </div>

            <div className="flex items-center justify-center gap-4 text-[10px] text-neutral-400">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                Instant activation
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                Cancel anytime
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                Official GST receipt
              </span>
            </div>
          </form>
        </div>

        {/* Right Column: Order Summary (Compact Card) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="p-4 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/80 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2.5 border-b border-neutral-100 dark:border-neutral-800">
              <h2 className="text-xs font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
                <Receipt className="w-3.5 h-3.5 text-[#F42A18]" />
                Order Summary
              </h2>
              <Badge className="bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border-none text-[10px] uppercase font-bold px-2 py-0.5">
                {billingCycle}
              </Badge>
            </div>

            {/* Plan Details Card */}
            <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200/60 dark:border-neutral-700/60 space-y-1">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-neutral-900 dark:text-white">
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
                <span>Subtotal ({billingCycle.toLowerCase()})</span>
                <span className="font-semibold text-neutral-900 dark:text-white">
                  ₹{basePrice.toFixed(2)}
                </span>
              </div>

              <div className="flex items-center justify-between text-neutral-600 dark:text-neutral-400">
                <span>GST ({DEFAULT_GST_PERCENT}%)</span>
                <span className="font-semibold text-neutral-900 dark:text-white">
                  ₹{taxAmount.toFixed(2)}
                </span>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-neutral-200/80 dark:border-neutral-800 text-sm font-bold">
                <span className="text-neutral-900 dark:text-white">Total Payable</span>
                <span className="text-[#F42A18]">
                  ₹{totalAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </span>
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
