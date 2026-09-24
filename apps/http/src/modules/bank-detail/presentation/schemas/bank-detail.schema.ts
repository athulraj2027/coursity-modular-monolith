import { z } from "zod";

export const createBankDetailSchema = z.object({
  methodType: z.enum(["BANK_ACCOUNT", "UPI"]).default("BANK_ACCOUNT"),
  accountHolderName: z.string().min(2, "Account holder name must be at least 2 characters"),
  accountNumber: z.string().optional().default(""),
  ifscCode: z.string().optional().default(""),
  bankName: z.string().optional().default(""),
  branchName: z.string().optional(),
  accountType: z.enum(["SAVINGS", "CURRENT"]).default("SAVINGS"),
  upiId: z.string().optional(),
  isPrimary: z.boolean().optional(),
}).refine((data) => {
  if (data.methodType === "BANK_ACCOUNT") {
    return (
      data.accountNumber.trim().length >= 6 &&
      data.ifscCode.trim().length >= 4 &&
      data.bankName.trim().length >= 2
    );
  }
  if (data.methodType === "UPI") {
    return data.upiId && data.upiId.trim().length >= 3;
  }
  return true;
}, {
  message: "Please provide valid account details for the selected payout method",
});

export const updateBankVerificationSchema = z.object({
  status: z.enum(["PENDING", "VERIFIED", "REJECTED", "FAILED"]),
  notes: z.string().optional(),
});
