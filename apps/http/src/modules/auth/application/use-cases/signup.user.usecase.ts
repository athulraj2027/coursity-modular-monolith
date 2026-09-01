import { UserRepository } from "@/modules/user";
import { PasswordService } from "../../domain/services/password.service";
import { ConflictError } from "@/app/errors";
import { SignupUserInputDTO, SignupUserOutputDTO } from "../dtos/signup.dto";
import { OtpRepository } from "../../domain/repositories/redis-otp.repository";

export class SignupUser {
    constructor(
        private readonly repository: UserRepository,
        private readonly passwordService: PasswordService,
        private readonly otpRepository: OtpRepository
    ) { }

    async execute(input: SignupUserInputDTO): Promise<SignupUserOutputDTO> {

        const email = input.email.toLowerCase().trim();

        // 1. Check whether user already exists
        const existingUser = await this.repository.findByEmail(email);

        if (existingUser)
            throw new ConflictError("An account with this email already exists");


        // 2. Hash password
        const hashedPassword = await this.passwordService.hash(input.password);
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        await this.otpRepository.saveSignupOtp(email, otp, {
            name: input.name.trim(),
            email,
            password: hashedPassword,
            role: input.role || "STUDENT",
        });

        return {
            email,
            message: "OTP sent to your email. Please verify to complete registration.",
        };
    }
}