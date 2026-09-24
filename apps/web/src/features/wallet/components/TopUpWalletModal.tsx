import React, { useState } from "react";
import { ModalTemplate } from "@/components/common/ModalTemplate";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Wallet as WalletIcon,
  ShieldCheck,
  Loader2,
  CreditCard,
} from "lucide-react";
import { useCreateTopUpOrder, useVerifyTopUp } from "../hooks/useWallet";
import { useCurrentUser } from "@/features/auth";
import { toast } from "@/lib/toast";

interface TopUpWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PRESET_AMOUNTS = [250, 500, 1000, 2500, 5000];

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if ((window as any).Razorpay) {
      return resolve(true);
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export const TopUpWalletModal: React.FC<TopUpWalletModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { data: user } = useCurrentUser();
  const [amount, setAmount] = useState<number>(500);
  const [customAmount, setCustomAmount] = useState<string>("500");
  const [isProcessing, setIsProcessing] = useState(false);

  const createOrderMutation = useCreateTopUpOrder();
  const verifyTopUpMutation = useVerifyTopUp();

  const handleSelectPreset = (val: number) => {
    setAmount(val);
    setCustomAmount(String(val));
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, "");
    setCustomAmount(val);
    setAmount(Number(val) || 0);
  };

  const handleInitiateTopUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || amount < 10) {
      toast.error("Minimum top-up amount is ₹10");
      return;
    }

    try {
      setIsProcessing(true);

      // 1. Ensure Razorpay checkout JS is loaded
      const isScriptLoaded = await loadRazorpayScript();
      if (!isScriptLoaded) {
        toast.error("Failed to load payment gateway SDK. Please check your network connection.");
        setIsProcessing(false);
        return;
      }

      // 2. Create Razorpay order on backend
      const order = await createOrderMutation.mutateAsync(amount);

      // 3. Open Razorpay Checkout Modal
      const options = {
        key: order.keyId,
        amount: Math.round(order.amount * 100),
        currency: order.currency || "INR",
        name: "Coursity Wallet",
        description: `Wallet Balance Top-Up (₹${order.amount.toFixed(2)})`,
        order_id: order.orderId,
        prefill: {
          name: user?.name || "",
          email: user?.email || "",
        },
        theme: {
          color: "#F42A18",
        },
        modal: {
          ondismiss: () => {
            setIsProcessing(false);
          },
        },
        handler: async (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          try {
            await verifyTopUpMutation.mutateAsync({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
            setIsProcessing(false);
            onClose();
          } catch {
            setIsProcessing(false);
          }
        },
      };

      const rzpInstance = new (window as any).Razorpay(options);
      rzpInstance.on("payment.failed", (resp: any) => {
        setIsProcessing(false);
        toast.error(resp?.error?.description || "Payment failed or was declined.");
      });
      rzpInstance.open();
    } catch (err: any) {
      setIsProcessing(false);
      toast.error(err?.message || "Failed to initiate top-up");
    }
  };

  const headerIcon = (
    <div className="w-10 h-10 rounded-2xl bg-[#F42A18]/10 text-[#F42A18] flex items-center justify-center">
      <WalletIcon className="w-5 h-5" />
    </div>
  );

  return (
    <ModalTemplate
      isOpen={isOpen}
      onClose={() => {
        if (!isProcessing) {
          onClose();
        }
      }}
      title="Top-Up Wallet Balance"
      description="Instantly deposit funds using UPI, Credit/Debit Cards, or NetBanking."
      icon={headerIcon}
      maxWidth="sm"
    >
      <form onSubmit={handleInitiateTopUp} className="space-y-5 pt-2">
        {/* Preset Quick Chips */}
        <div className="space-y-2">
          <Label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
            Select Quick Amount
          </Label>
          <div className="grid grid-cols-5 gap-2">
            {PRESET_AMOUNTS.map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => handleSelectPreset(val)}
                className={`h-10 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                  amount === val
                    ? "bg-[#F42A18] text-white border-[#F42A18] shadow-sm shadow-[#F42A18]/25"
                    : "bg-neutral-50 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700 hover:border-[#F42A18]/40"
                }`}
              >
                ₹{val}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Amount Input */}
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
            Custom Amount (INR)
          </Label>
          <div className="relative">
            <span className="absolute left-3.5 top-3 text-sm font-bold text-neutral-400">
              ₹
            </span>
            <Input
              type="text"
              value={customAmount}
              onChange={handleCustomChange}
              placeholder="Enter deposit amount"
              className="pl-8 font-mono font-bold text-base h-11 rounded-xl bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700"
            />
          </div>
          <span className="text-[11px] text-neutral-400">
            Minimum top-up: ₹10 • Instant credit upon completion
          </span>
        </div>

        {/* Security Notice */}
        <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/80 dark:border-neutral-700/60 text-xs flex items-start gap-2.5 text-neutral-600 dark:text-neutral-300">
          <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
          <p className="text-[11px] leading-relaxed">
            Payments are 256-bit encrypted and processed via RBI-authorized Razorpay gateway. Wallet balances do not expire.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isProcessing}
            className="rounded-xl text-xs"
          >
            Cancel
          </Button>

          <Button
            type="submit"
            disabled={isProcessing || amount < 10}
            className="bg-[#F42A18] hover:bg-[#d92212] text-white text-xs font-bold rounded-xl px-6 shadow-md shadow-[#F42A18]/25 cursor-pointer flex items-center gap-2"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <CreditCard className="w-4 h-4" />
                <span>Pay ₹{amount.toLocaleString()}</span>
              </>
            )}
          </Button>
        </div>
      </form>
    </ModalTemplate>
  );
};

export default TopUpWalletModal;
