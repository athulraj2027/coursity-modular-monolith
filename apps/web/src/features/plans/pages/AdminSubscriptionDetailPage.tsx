import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Zap,
  RotateCcw,
  CalendarPlus,
  ArrowRightLeft,
  XCircle,
  CheckCircle2,
  Clock,
  ExternalLink,
  Receipt,
  FileText,
  Phone,
  Mail,
  MapPin,
  Copy,
  Check,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  useAdminSubscriptionDetail,
  useAdminCancelSubscription,
  useAdminRefundInvoice,
  useAdminExtendSubscription,
  useAdminChangeSubscriptionPlan,
} from "../hooks/useAdminSubscriptions";
import {
  CancelSubscriptionModal,
  RefundInvoiceModal,
  ExtendSubscriptionModal,
  ChangePlanModal,
} from "../components/AdminSubscriptionModals";
import type { SubscriptionStatus } from "../types/plan.types";

export const AdminSubscriptionDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: sub, isLoading, error } = useAdminSubscriptionDetail(id);

  // Mutations
  const cancelMutation = useAdminCancelSubscription();
  const refundMutation = useAdminRefundInvoice();
  const extendMutation = useAdminExtendSubscription();
  const changePlanMutation = useAdminChangeSubscriptionPlan();

  // Modals state
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isExtendModalOpen, setIsExtendModalOpen] = useState(false);
  const [isChangePlanModalOpen, setIsChangePlanModalOpen] = useState(false);
  const [selectedInvoiceForRefund, setSelectedInvoiceForRefund] = useState<any | null>(null);
  const [copiedId, setCopiedId] = useState(false);

  const handleCopyId = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handlePrintInvoice = (invoice: any) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const formattedDate = invoice.paidAt
      ? new Date(invoice.paidAt).toLocaleDateString("en-IN", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : new Date(invoice.createdAt).toLocaleDateString("en-IN", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });

    const totalAmount = Number(invoice.totalAmount ?? invoice.amount ?? 0);
    const baseAmount = Number(
      invoice.baseAmount ?? (totalAmount > 0 ? Math.round((totalAmount / 1.18) * 100) / 100 : 0)
    );
    const taxAmount = Number(
      invoice.taxAmount ?? (totalAmount > 0 ? Math.round((totalAmount - baseAmount) * 100) / 100 : 0)
    );
    const taxPercent = invoice.taxPercent ?? 18;
    const paymentGateway = (invoice.paymentGateway || invoice.paymentMethod || "Razorpay").toUpperCase();
    const billingCycle = invoice.billingCycle || sub?.plan?.billingCycle || "MONTHLY";
    const planTitle = invoice.planName || sub?.plan?.name || "Instructor Plan";
    const customerName = invoice.userName || sub?.instructor?.name || "Valued Educator";
    const customerEmail = invoice.userEmail || sub?.instructor?.email || "";
    const customerPhone = invoice.userPhone || sub?.instructor?.phone || "";
    const customerState = invoice.userState || "";
    const customerCountry = invoice.userCountry || sub?.instructor?.country || "India";
    const gstin = invoice.gstin || "";
    const paymentId = invoice.gatewayPaymentId || sub?.externalSubscriptionId || "";
    const orderId = invoice.gatewayOrderId || "";

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Tax Invoice - ${invoice.invoiceNumber}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 40px; color: #111; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #F42A18; padding-bottom: 20px; }
            .logo { font-size: 24px; font-weight: 800; color: #F42A18; }
            .invoice-title { font-size: 20px; font-weight: bold; }
            .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 30px 0; }
            .box { padding: 15px; border-radius: 8px; background: #f9f9f9; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { text-align: left; padding: 12px; background: #f3f4f6; border-bottom: 1px solid #ddd; }
            td { padding: 12px; border-bottom: 1px solid #eee; }
            .totals { margin-top: 30px; float: right; width: 300px; }
            .totals-row { display: flex; justify-content: space-between; padding: 6px 0; }
            .grand-total { font-size: 18px; font-weight: bold; border-top: 2px solid #111; padding-top: 10px; color: #F42A18; }
            .footer { margin-top: 80px; text-align: center; font-size: 12px; color: #888; border-top: 1px solid #eee; padding-top: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="logo">COURSITY</div>
              <p style="margin: 4px 0 0 0; font-size: 13px; color: #666;">Empowering Educators Worldwide</p>
            </div>
            <div style="text-align: right;">
              <div class="invoice-title">TAX INVOICE</div>
              <p style="margin: 4px 0 0 0; font-size: 13px; color: #666;">Invoice #: <strong>${invoice.invoiceNumber}</strong></p>
              <p style="margin: 2px 0 0 0; font-size: 13px; color: #666;">Date: ${formattedDate}</p>
            </div>
          </div>

          <div class="meta-grid">
            <div class="box">
              <strong style="font-size: 13px; text-transform: uppercase; color: #888;">Billed To:</strong>
              <p style="margin: 6px 0 2px 0; font-weight: bold;">${customerName}</p>
              ${customerEmail ? `<p style="margin: 0; font-size: 13px; color: #555;">Email: ${customerEmail}</p>` : ""}
              ${customerPhone ? `<p style="margin: 0; font-size: 13px; color: #555;">Phone: ${customerPhone}</p>` : ""}
              ${customerState ? `<p style="margin: 0; font-size: 13px; color: #555;">State: ${customerState}, ${customerCountry}</p>` : ""}
              ${gstin ? `<p style="margin: 4px 0 0 0; font-size: 13px; color: #555;"><strong>GSTIN:</strong> ${gstin}</p>` : ""}
            </div>
            <div class="box">
              <strong style="font-size: 13px; text-transform: uppercase; color: #888;">Payment Information:</strong>
              <p style="margin: 6px 0 2px 0; font-weight: bold;">Gateway: ${paymentGateway}</p>
              ${paymentId ? `<p style="margin: 0; font-size: 13px; color: #555;">Payment ID: ${paymentId}</p>` : ""}
              ${orderId ? `<p style="margin: 0; font-size: 13px; color: #555;">Order ID: ${orderId}</p>` : ""}
              <p style="margin: 4px 0 0 0; font-size: 13px; color: #16a34a; font-weight: bold;">Status: ${invoice.status}</p>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Description</th>
                <th>Billing Cycle</th>
                <th style="text-align: right;">Base Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>${planTitle}</strong> Subscription Tier Access</td>
                <td>${billingCycle}</td>
                <td style="text-align: right;">₹${baseAmount.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>

          <div class="totals">
            <div class="totals-row">
              <span>Base Subtotal:</span>
              <span>₹${baseAmount.toFixed(2)}</span>
            </div>
            <div class="totals-row">
              <span>GST (${taxPercent}%):</span>
              <span>₹${taxAmount.toFixed(2)}</span>
            </div>
            <div class="totals-row grand-total">
              <span>Total Paid:</span>
              <span>₹${totalAmount.toFixed(2)}</span>
            </div>
          </div>

          <div style="clear: both;"></div>

          <div class="footer">
            <p>This is a computer-generated tax invoice. No signature required.</p>
            <p>Coursity EdTech Technologies Pvt Ltd • support@coursity.com</p>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  if (isLoading) {
    return (
      <div className="p-12 text-center max-w-5xl mx-auto space-y-4">
        <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mx-auto" />
        <p className="text-xs text-neutral-500">Loading subscription details...</p>
      </div>
    );
  }

  if (error || !sub) {
    return (
      <div className="p-12 text-center max-w-xl mx-auto space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-600 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-neutral-900 dark:text-white">Subscription Not Found</h2>
        <p className="text-xs text-neutral-500">
          The requested subscription ID could not be located or has been deleted.
        </p>
        <Button
          onClick={() => navigate("/admin/subscriptions")}
          variant="outline"
          className="text-xs rounded-xl"
        >
          Back to Subscriptions
        </Button>
      </div>
    );
  }

  const instructor = sub.instructor;
  const plan = sub.plan;
  const periodEnd = new Date(sub.currentPeriodEnd);
  const isPast = periodEnd < new Date();

  // Compute Days Remaining
  const now = new Date();
  const diffTime = periodEnd.getTime() - now.getTime();
  const daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

  const getStatusBadge = (status: SubscriptionStatus, cancelAtPeriodEnd: boolean) => {
    switch (status) {
      case "ACTIVE":
        return (
          <div className="flex items-center gap-2">
            <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-bold text-xs px-2.5 py-1 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Active Subscription
            </Badge>
            {cancelAtPeriodEnd && (
              <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-semibold text-xs px-2 py-0.5">
                Cancels at period end
              </Badge>
            )}
          </div>
        );
      case "PAST_DUE":
        return (
          <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-bold text-xs px-2.5 py-1 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            Payment Past Due
          </Badge>
        );
      case "CANCELED":
        return (
          <Badge className="bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 font-bold text-xs px-2.5 py-1 flex items-center gap-1.5">
            <XCircle className="w-3.5 h-3.5" />
            Canceled
          </Badge>
        );
      case "EXPIRED":
        return (
          <Badge className="bg-neutral-500/10 text-neutral-600 dark:text-neutral-400 border border-neutral-500/20 font-bold text-xs px-2.5 py-1">
            Expired
          </Badge>
        );
      default:
        return <Badge className="text-xs">{status}</Badge>;
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Breadcrumbs & Back Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate("/admin/subscriptions")}
          className="flex items-center gap-2 text-xs font-semibold text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Subscriptions Catalog</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs text-neutral-400">ID: {sub.id}</span>
          <button
            onClick={() => handleCopyId(sub.id)}
            title="Copy Subscription ID"
            className="p-1 rounded-lg border border-neutral-200 dark:border-neutral-800 text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer"
          >
            {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Main Header Banner */}
      <div className="p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-extrabold text-neutral-900 dark:text-white">
              {instructor.name}
            </h1>
            {getStatusBadge(sub.status, sub.cancelAtPeriodEnd)}
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-500 dark:text-neutral-400">
            <span>
              Plan Tier:{" "}
              <strong className="text-purple-600 dark:text-purple-400 font-semibold">
                {plan?.name || "Standard Plan"}
              </strong>
            </span>
            <span>•</span>
            <span>
              Billing:{" "}
              <strong className="text-neutral-900 dark:text-white font-semibold">
                ₹{plan?.price.toLocaleString()}/{plan?.billingCycle.toLowerCase()}
              </strong>
            </span>
            <span>•</span>
            <span>
              {isPast ? (
                <span className="text-red-500 font-semibold">Period Expired</span>
              ) : (
                <span>
                  Expires in <strong className="text-emerald-600 dark:text-emerald-400 font-semibold">{daysRemaining} days</strong> ({periodEnd.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })})
                </span>
              )}
            </span>
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          {sub.status === "ACTIVE" && !sub.cancelAtPeriodEnd && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsCancelModalOpen(true)}
              className="text-xs rounded-xl border-neutral-200 dark:border-neutral-800 hover:text-red-600 hover:border-red-500/30 cursor-pointer flex items-center gap-1.5"
            >
              <XCircle className="w-3.5 h-3.5 text-red-500" />
              <span>Cancel Subscription</span>
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsExtendModalOpen(true)}
            className="text-xs rounded-xl border-neutral-200 dark:border-neutral-800 hover:text-blue-600 hover:border-blue-500/30 cursor-pointer flex items-center gap-1.5"
          >
            <CalendarPlus className="w-3.5 h-3.5 text-blue-500" />
            <span>Extend Days</span>
          </Button>

          <Button
            size="sm"
            onClick={() => setIsChangePlanModalOpen(true)}
            className="text-xs rounded-xl font-medium bg-purple-600 hover:bg-purple-700 text-white shadow-md shadow-purple-500/20 cursor-pointer flex items-center gap-1.5"
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            <span>Change Plan</span>
          </Button>
        </div>
      </div>

      {/* Two Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (1 col): Instructor Profile & Plan Specs */}
        <div className="space-y-6">
          {/* Instructor Card */}
          <div className="p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
              <span className="text-xs font-bold text-neutral-900 dark:text-white uppercase tracking-wider">
                Instructor Profile
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(`/admin/teachers/${instructor.id}`)}
                className="h-7 text-[11px] text-emerald-600 dark:text-emerald-400 p-0 hover:bg-transparent flex items-center gap-1 cursor-pointer"
              >
                <span>View Full Profile</span>
                <ExternalLink className="w-3 h-3" />
              </Button>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 flex items-center justify-center font-bold text-neutral-700 dark:text-neutral-300 text-sm overflow-hidden shrink-0">
                {instructor.avatar ? (
                  <img src={instructor.avatar} alt={instructor.name} className="w-full h-full object-cover" />
                ) : (
                  instructor.name.charAt(0).toUpperCase()
                )}
              </div>
              <div className="space-y-1 min-w-0">
                <h3 className="text-sm font-bold text-neutral-900 dark:text-white truncate">
                  {instructor.name}
                </h3>
                <div className="flex items-center gap-2">
                  <Badge
                    className={
                      instructor.isApproved
                        ? "bg-emerald-500/10 text-emerald-600 text-[10px] py-0 px-1.5"
                        : "bg-amber-500/10 text-amber-600 text-[10px] py-0 px-1.5"
                    }
                  >
                    {instructor.isApproved ? "Verified Teacher" : instructor.approvalStatus}
                  </Badge>
                  <span className="text-[11px] text-neutral-400">
                    {instructor.courseCount} {instructor.courseCount === 1 ? "course" : "courses"}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2 pt-2 text-xs border-t border-neutral-100 dark:border-neutral-800">
              <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400">
                <Mail className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                <span className="truncate">{instructor.email}</span>
              </div>
              {instructor.phone && (
                <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400">
                  <Phone className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                  <span>{instructor.phone}</span>
                </div>
              )}
              {instructor.country && (
                <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400">
                  <MapPin className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                  <span>{instructor.country}</span>
                </div>
              )}
            </div>
          </div>

          {/* Plan Details & External Gateway IDs */}
          <div className="p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
              <span className="text-xs font-bold text-neutral-900 dark:text-white uppercase tracking-wider">
                Plan Specification
              </span>
              <Badge className="bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 text-[10px]">
                {plan?.billingCycle}
              </Badge>
            </div>

            <div className="space-y-2">
              <h4 className="text-base font-extrabold text-neutral-900 dark:text-white">
                {plan?.name}
              </h4>
              {plan?.tagline && (
                <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                  {plan.tagline}
                </p>
              )}
            </div>

            <div className="p-3 rounded-xl border border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/40 space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-neutral-500">Cycle Price:</span>
                <span className="font-bold text-neutral-900 dark:text-white">
                  ₹{plan?.price.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-neutral-500">Period Start:</span>
                <span className="font-medium text-neutral-700 dark:text-neutral-300">
                  {new Date(sub.currentPeriodStart).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-neutral-500">Period End:</span>
                <span className="font-medium text-neutral-700 dark:text-neutral-300">
                  {periodEnd.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </span>
              </div>
              {sub.externalSubscriptionId && (
                <div className="flex justify-between items-center pt-1 border-t border-neutral-200 dark:border-neutral-800">
                  <span className="text-neutral-500">Payment ID:</span>
                  <span className="font-mono text-[11px] text-neutral-700 dark:text-neutral-300 truncate max-w-[140px]">
                    {sub.externalSubscriptionId}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column (2 cols): Usage Gauges & Invoices */}
        <div className="lg:col-span-2 space-y-6">
          {/* Metered Usage vs Quotas */}
          <div className="p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-xs font-bold text-neutral-900 dark:text-white uppercase tracking-wider">
                  Live Quota Allocations & Metered Usage
                </span>
              </div>
              <span className="text-[11px] text-neutral-400">Current Billing Cycle</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(plan?.features || []).map((feat) => {
                const recordedUsage = sub.usages.find((u) => u.featureCode === feat.code)?.currentUsage || 0;
                const numericLimit = parseFloat(feat.value);
                const percent = !feat.isUnlimited && !isNaN(numericLimit) && numericLimit > 0
                  ? Math.min(100, Math.round((recordedUsage / numericLimit) * 100))
                  : 0;

                return (
                  <div
                    key={feat.id}
                    className="p-3.5 rounded-xl border border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/30 space-y-2.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold text-neutral-900 dark:text-white block">
                          {feat.name || feat.code}
                        </span>
                        <span className="text-[10px] text-neutral-400 block">
                          Category: {feat.category || "GENERAL"}
                        </span>
                      </div>
                      <Badge className="bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-[10px] py-0 px-1.5 font-bold">
                        {feat.isUnlimited ? "Unlimited" : `${feat.value} ${feat.unit || ""}`}
                      </Badge>
                    </div>

                    {/* Progress Bar for Numeric Quotas */}
                    {!feat.isUnlimited && !isNaN(numericLimit) && (
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] text-neutral-500">
                          <span>Used: {recordedUsage} {feat.unit || ""}</span>
                          <span>{percent}%</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-neutral-200 dark:bg-neutral-800 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              percent >= 90
                                ? "bg-red-500"
                                : percent >= 75
                                ? "bg-amber-500"
                                : "bg-emerald-500"
                            }`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Invoices & Payment History */}
          <div className="p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span className="text-xs font-bold text-neutral-900 dark:text-white uppercase tracking-wider">
                  Invoices & Payment Receipts ({sub.invoices.length})
                </span>
              </div>
            </div>

            {sub.invoices.length === 0 ? (
              <div className="p-6 text-center text-neutral-400 text-xs">
                No invoices recorded for this subscription yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-neutral-100 dark:border-neutral-800 text-neutral-400 text-[11px]">
                      <th className="pb-2 font-medium">Invoice #</th>
                      <th className="pb-2 font-medium">Date</th>
                      <th className="pb-2 font-medium">Amount</th>
                      <th className="pb-2 font-medium">Status</th>
                      <th className="pb-2 font-medium">Gateway</th>
                      <th className="pb-2 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                    {sub.invoices.map((inv) => (
                      <tr key={inv.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-900/30">
                        <td className="py-3 font-semibold text-neutral-900 dark:text-white font-mono">
                          #{inv.invoiceNumber}
                        </td>
                        <td className="py-3 text-neutral-500">
                          {new Date(inv.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>
                        <td className="py-3 font-bold text-neutral-900 dark:text-white">
                          ₹{inv.amount.toLocaleString()}
                        </td>
                        <td className="py-3">
                          {inv.status === "PAID" ? (
                            <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px]">
                              Paid
                            </Badge>
                          ) : inv.status === "REFUNDED" ? (
                            <Badge className="bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 text-[10px]">
                              Refunded
                            </Badge>
                          ) : (
                            <Badge className="bg-neutral-500/10 text-neutral-600 text-[10px]">
                              {inv.status}
                            </Badge>
                          )}
                        </td>
                        <td className="py-3">
                          {inv.receiptUrl ? (
                            <a
                              href={inv.receiptUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 text-[11px]"
                            >
                              <span>Receipt</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          ) : (
                            <span className="text-neutral-400 text-[11px]">—</span>
                          )}
                        </td>
                        <td className="py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handlePrintInvoice(inv)}
                              className="h-7 text-[11px] rounded-lg text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white cursor-pointer flex items-center gap-1"
                              title="View and print tax invoice"
                            >
                              <FileText className="w-3 h-3 text-neutral-400" />
                              <span>Invoice</span>
                            </Button>

                            {inv.status === "PAID" ? (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setSelectedInvoiceForRefund(inv)}
                                className="h-7 text-[11px] rounded-lg border-neutral-200 dark:border-neutral-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 cursor-pointer flex items-center gap-1"
                              >
                                <RotateCcw className="w-3 h-3" />
                                <span>Issue Refund</span>
                              </Button>
                            ) : inv.status === "REFUNDED" ? (
                              <span className="text-[11px] text-purple-600 dark:text-purple-400 font-semibold px-2">
                                Refund Issued
                              </span>
                            ) : null}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <CancelSubscriptionModal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        onConfirm={async (data) => {
          await cancelMutation.mutateAsync({
            subscriptionId: sub.id,
            immediate: data.immediate,
            reason: data.reason,
          });
          setIsCancelModalOpen(false);
        }}
        subscriptionId={sub.id}
        instructorName={instructor.name}
        planName={plan?.name}
        currentPeriodEnd={sub.currentPeriodEnd}
        isLoading={cancelMutation.isPending}
      />

      <ExtendSubscriptionModal
        isOpen={isExtendModalOpen}
        onClose={() => setIsExtendModalOpen(false)}
        onConfirm={async (data) => {
          await extendMutation.mutateAsync({
            subscriptionId: sub.id,
            daysToAdd: data.daysToAdd,
            newPeriodEnd: data.newPeriodEnd,
            reason: data.reason,
          });
          setIsExtendModalOpen(false);
        }}
        currentPeriodEnd={sub.currentPeriodEnd}
        instructorName={instructor.name}
        isLoading={extendMutation.isPending}
      />

      <ChangePlanModal
        isOpen={isChangePlanModalOpen}
        onClose={() => setIsChangePlanModalOpen(false)}
        onConfirm={async (data) => {
          await changePlanMutation.mutateAsync({
            subscriptionId: sub.id,
            newPlanId: data.newPlanId,
            resetPeriod: data.resetPeriod,
          });
          setIsChangePlanModalOpen(false);
        }}
        currentPlanId={sub.planId}
        instructorName={instructor.name}
        isLoading={changePlanMutation.isPending}
      />

      {selectedInvoiceForRefund && (
        <RefundInvoiceModal
          isOpen={Boolean(selectedInvoiceForRefund)}
          onClose={() => setSelectedInvoiceForRefund(null)}
          onConfirm={async (data) => {
            await refundMutation.mutateAsync({
              subscriptionId: sub.id,
              invoiceId: data.invoiceId,
              amount: data.amount,
              reason: data.reason,
              cancelSubscriptionImmediately: data.cancelSubscriptionImmediately,
            });
            setSelectedInvoiceForRefund(null);
          }}
          invoice={selectedInvoiceForRefund}
          isLoading={refundMutation.isPending}
        />
      )}
    </div>
  );
};

export default AdminSubscriptionDetailPage;
