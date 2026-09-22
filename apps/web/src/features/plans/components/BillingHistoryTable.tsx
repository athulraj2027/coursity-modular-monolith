import React from "react";
import type { SubscriptionInvoice } from "../types/plan.types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  FileText,
  CheckCircle2,
  Clock,
  AlertCircle,
  Download,
  Receipt,
} from "lucide-react";

interface BillingHistoryTableProps {
  invoices: SubscriptionInvoice[];
  isLoading?: boolean;
}

export const BillingHistoryTable: React.FC<BillingHistoryTableProps> = ({
  invoices,
  isLoading = false,
}) => {
  const handlePrintReceipt = (invoice: SubscriptionInvoice) => {
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

    const amount = Number(invoice.amount || 0);
    const taxAmount = Number(invoice.taxAmount ?? Math.round(amount * 0.18 * 100) / 100);
    const totalAmount = Number(invoice.totalAmount ?? (amount + taxAmount));
    const paymentGateway = (invoice.paymentGateway || invoice.paymentMethod || "Razorpay").toUpperCase();
    const billingCycle = invoice.billingCycle || "MONTHLY";

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
              <p style="margin: 6px 0 2px 0; font-weight: bold;">${invoice.customerName || "Valued Educator"}</p>
              <p style="margin: 0; font-size: 13px; color: #555;">${invoice.customerEmail || ""}</p>
              ${invoice.customerPhone ? `<p style="margin: 0; font-size: 13px; color: #555;">Phone: ${invoice.customerPhone}</p>` : ""}
              ${invoice.customerState ? `<p style="margin: 0; font-size: 13px; color: #555;">State: ${invoice.customerState}, ${invoice.customerCountry || "India"}</p>` : ""}
              ${invoice.gstin ? `<p style="margin: 4px 0 0 0; font-size: 13px; color: #555;"><strong>GSTIN:</strong> ${invoice.gstin}</p>` : ""}
            </div>
            <div class="box">
              <strong style="font-size: 13px; text-transform: uppercase; color: #888;">Payment Information:</strong>
              <p style="margin: 6px 0 2px 0; font-weight: bold;">Gateway: ${paymentGateway}</p>
              ${invoice.gatewayPaymentId ? `<p style="margin: 0; font-size: 13px; color: #555;">Payment ID: ${invoice.gatewayPaymentId}</p>` : ""}
              ${invoice.gatewayOrderId ? `<p style="margin: 0; font-size: 13px; color: #555;">Order ID: ${invoice.gatewayOrderId}</p>` : ""}
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
                <td><strong>${invoice.plan?.name || "Instructor Subscription Tier"}</strong> Plan Access</td>
                <td>${billingCycle}</td>
                <td style="text-align: right;">₹${amount.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>

          <div class="totals">
            <div class="totals-row">
              <span>Subtotal:</span>
              <span>₹${amount.toFixed(2)}</span>
            </div>
            <div class="totals-row">
              <span>GST (18%):</span>
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
      <div className="p-8 text-center border border-neutral-200/80 dark:border-neutral-800 rounded-2xl bg-white/40 dark:bg-neutral-900/40">
        <Clock className="w-6 h-6 mx-auto mb-2 text-neutral-400 animate-spin" />
        <p className="text-xs text-neutral-500">Loading billing invoices...</p>
      </div>
    );
  }

  if (invoices.length === 0) {
    return (
      <div className="p-8 text-center border border-dashed border-neutral-300 dark:border-neutral-800 rounded-2xl bg-neutral-50/50 dark:bg-neutral-900/20">
        <Receipt className="w-10 h-10 mx-auto mb-3 text-neutral-400 opacity-60" />
        <h3 className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
          No Invoices Generated Yet
        </h3>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-sm mx-auto mt-1">
          When you upgrade or renew an instructor subscription plan, tax invoices and payment receipts will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white/60 dark:bg-neutral-900/60 backdrop-blur-xs shadow-xs">
      <table className="w-full text-left text-xs border-collapse">
        <thead>
          <tr className="border-b border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/80 dark:bg-neutral-800/40 text-neutral-500 dark:text-neutral-400 uppercase tracking-wider font-semibold">
            <th className="px-5 py-3.5">Invoice #</th>
            <th className="px-5 py-3.5">Plan / Description</th>
            <th className="px-5 py-3.5">Date</th>
            <th className="px-5 py-3.5">Cycle</th>
            <th className="px-5 py-3.5">Total Amount</th>
            <th className="px-5 py-3.5">Status</th>
            <th className="px-5 py-3.5 text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-200/60 dark:divide-neutral-800/60 text-neutral-700 dark:text-neutral-300">
          {invoices.map((inv) => {
            const rawAmount = Number(inv.amount || 0);
            const total = Number(inv.totalAmount ?? (rawAmount * 1.18));
            const cycle = inv.billingCycle || "MONTHLY";

            return (
              <tr
                key={inv.id}
                className="hover:bg-neutral-50/60 dark:hover:bg-neutral-800/30 transition-colors"
              >
                <td className="px-5 py-4 font-mono font-medium text-neutral-900 dark:text-white">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-neutral-400" />
                    <span>{inv.invoiceNumber}</span>
                  </div>
                </td>
                <td className="px-5 py-4 font-medium text-neutral-900 dark:text-white">
                  {inv.plan?.name || "Instructor Plan"}
                </td>
                <td className="px-5 py-4 text-neutral-500">
                  {new Date(inv.paidAt || inv.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </td>
                <td className="px-5 py-4">
                  <span className="text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 uppercase">
                    {cycle}
                  </span>
                </td>
                <td className="px-5 py-4 font-bold text-neutral-900 dark:text-white">
                  ₹{total.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td className="px-5 py-4">
                  {inv.status === "PAID" ? (
                    <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-medium text-[10px] gap-1 px-2 py-0.5">
                      <CheckCircle2 className="w-3 h-3" />
                      PAID
                    </Badge>
                  ) : inv.status === "PENDING" ? (
                    <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-medium text-[10px] gap-1 px-2 py-0.5">
                      <Clock className="w-3 h-3" />
                      PENDING
                    </Badge>
                  ) : (
                    <Badge className="bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 font-medium text-[10px] gap-1 px-2 py-0.5">
                      <AlertCircle className="w-3 h-3" />
                      {inv.status}
                    </Badge>
                  )}
                </td>
                <td className="px-5 py-4 text-right">
                  <Button
                    onClick={() => handlePrintReceipt(inv)}
                    variant="ghost"
                    size="sm"
                    className="h-8 gap-1.5 text-xs text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Invoice
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
