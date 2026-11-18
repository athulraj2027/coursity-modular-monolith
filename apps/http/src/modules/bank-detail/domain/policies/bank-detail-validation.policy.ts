import { CreateBankDetailDto } from "../dtos/bank-detail.dto";
import { BadRequestError } from "@/app/errors";

export class BankDetailValidationPolicy {
  // Indian Financial System Code: 4 letters + '0' + 6 alphanumeric characters
  private static readonly IFSC_REGEX = /^[A-Z]{4}0[A-Z0-9]{6}$/;

  // Standard Indian Bank Account Number: 9 to 18 numeric digits
  private static readonly ACCOUNT_NUMBER_REGEX = /^\d{9,18}$/;

  // UPI Virtual Payment Address format: username@bank
  private static readonly UPI_REGEX = /^[\w.-]+@[\w.-]+$/;

  /**
   * Checks if an IFSC code adheres to the standard 11-character Indian banking format.
   */
  static isValidIfsc(ifsc: string): boolean {
    if (!ifsc) return false;
    return this.IFSC_REGEX.test(this.normalizeIfsc(ifsc));
  }

  /**
   * Normalizes IFSC code: trimmed and uppercased.
   */
  static normalizeIfsc(ifsc: string): string {
    return ifsc ? ifsc.trim().toUpperCase() : "";
  }

  /**
   * Checks if an account number contains between 9 and 18 numeric digits.
   */
  static isValidAccountNumber(accountNumber: string): boolean {
    if (!accountNumber) return false;
    return this.ACCOUNT_NUMBER_REGEX.test(this.normalizeAccountNumber(accountNumber));
  }

  /**
   * Normalizes account number by trimming and stripping whitespace and hyphens.
   */
  static normalizeAccountNumber(accountNumber: string): string {
    return accountNumber ? accountNumber.trim().replace(/[\s-]+/g, "") : "";
  }

  /**
   * Checks if a string conforms to the UPI VPA standard.
   */
  static isValidUpi(upi: string): boolean {
    if (!upi) return false;
    return this.UPI_REGEX.test(this.normalizeUpi(upi));
  }

  /**
   * Normalizes UPI ID: trimmed and lowercased.
   */
  static normalizeUpi(upi: string): string {
    return upi ? upi.trim().toLowerCase() : "";
  }

  /**
   * Validates bank detail inputs according to the payout method selected.
   * Throws BadRequestError with descriptive error message if invalid.
   */
  static validate(dto: Partial<CreateBankDetailDto>): void {
    if (!dto) {
      throw new BadRequestError("Bank detail data is required");
    }

    const methodType = dto.methodType || "BANK_ACCOUNT";

    if (methodType === "BANK_ACCOUNT") {
      this.validateBankAccount(dto);
    } else if (methodType === "UPI") {
      this.validateUpiAccount(dto);
    } else {
      throw new BadRequestError(`Unsupported payout method: ${methodType}`);
    }
  }

  /**
   * Alias for validate(dto)
   */
  static validateCreation(dto: Partial<CreateBankDetailDto>): void {
    this.validate(dto);
  }

  private static validateBankAccount(dto: Partial<CreateBankDetailDto>): void {
    if (!dto.accountHolderName || !dto.accountHolderName.trim()) {
      throw new BadRequestError("Account holder name is required");
    }

    const normalizedAccount = this.normalizeAccountNumber(dto.accountNumber ?? "");
    if (!normalizedAccount) {
      throw new BadRequestError("Account number is required");
    }
    if (!this.isValidAccountNumber(normalizedAccount)) {
      throw new BadRequestError("Account number must be between 9 and 18 numeric digits");
    }

    const normalizedIfsc = this.normalizeIfsc(dto.ifscCode ?? "");
    if (!normalizedIfsc) {
      throw new BadRequestError("IFSC Code is required");
    }
    if (!this.isValidIfsc(normalizedIfsc)) {
      throw new BadRequestError(
        "Invalid IFSC Code format. Expected 11 characters (e.g. HDFC0001234, SBIN0004567)"
      );
    }

    if (!dto.bankName || !dto.bankName.trim()) {
      throw new BadRequestError("Bank name is required");
    }
  }

  private static validateUpiAccount(dto: Partial<CreateBankDetailDto>): void {
    if (!dto.accountHolderName || !dto.accountHolderName.trim()) {
      throw new BadRequestError("Account holder name is required");
    }

    const normalizedUpi = this.normalizeUpi(dto.upiId ?? "");
    if (!normalizedUpi) {
      throw new BadRequestError("UPI ID is required");
    }
    if (!this.isValidUpi(normalizedUpi)) {
      throw new BadRequestError("Invalid UPI ID format (e.g. name@okhdfcbank or 9876543210@paytm)");
    }
  }
}
