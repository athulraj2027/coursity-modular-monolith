import { OtpRepository } from "@/modules/auth/domain/repositories/redis-otp.repository";
import { UserRepository } from "@/modules/user";
import { BadRequestError, ConflictError } from "@/app/errors";

export interface VerifySignupOtpInput {
    email: string;
    otp: string;
}

export class VerifySignupOtp {
    constructor(
        private readonly otpRepository: OtpRepository,
        private readonly userRepository: UserRepository
    ) { }

    async execute(input: VerifySignupOtpInput) {
        const email = input.email.toLowerCase().trim();

        // 1. Fetch cached OTP & user data from Redis
        const stored = await this.otpRepository.getSignupOtp(email);
        if (!stored) {
            throw new BadRequestError("OTP has expired or is invalid");
        }

        // 2. Verify OTP match
        if (stored.otp !== input.otp) {
            throw new BadRequestError("Invalid OTP");
        }

        // 3. Double-check user doesn't already exist
        const existingUser = await this.userRepository.findByEmail(email);
        if (existingUser) {
            throw new ConflictError("An account with this email already exists");
        }

        // 4. Create the actual user in the database
        const user = await this.userRepository.create({
            name: stored.userData.name,
            email: stored.userData.email,
            password: stored.userData.password,
            role: stored.userData.role,
            authProvider: "LOCAL",
            isEmailVerified: true, // ✅ Verified via OTP!
        });

        // 5. Invalidate the OTP in Redis
        await this.otpRepository.deleteSignupOtp(email);

        return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
        };
    }
}
