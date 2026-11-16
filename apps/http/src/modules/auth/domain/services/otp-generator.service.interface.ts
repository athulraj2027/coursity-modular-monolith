export interface IOtpGenerator {
    /**
     * Generates a numeric OTP of specified length (default 6 digits)
     */
    generate(length?: number): string;
}

