import { OtpRepository } from "@/modules/auth/domain/repositories/redis-otp.repository";
import { UserRepository } from "@/modules/user";
import { TokenService } from "../../domain/services/token.service";
import { TokenRepository } from "../../domain/repositories/token.repository";
import { BadRequestError, ConflictError } from "@/app/errors";

export interface VerifySignupOtpInput {
    email: string;
    otp: string;
}

export class VerifySignupOtp {
    constructor(
        private readonly otpRepository: OtpRepository,
        private readonly userRepository: UserRepository,
        private readonly tokenService: TokenService,
        private readonly tokenRepository: TokenRepository
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
        });

        // 5. Invalidate the OTP in Redis
        await this.otpRepository.deleteSignupOtp(email);

        // 6. Generate Access & Refresh tokens for automatic sign-in
        const tokens = this.tokenService.generateAuthTokens({
            userId: user.id,
            email: user.email,
            role: user.role,
        });

        // 7. Save Refresh Token in Redis session storage
        await this.tokenRepository.saveRefreshToken(user.id, tokens.refreshToken);

        return {
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
        };
    }
}
