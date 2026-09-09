import { UserRepository } from "@/modules/user";
import { PasswordService } from "../../domain/services/password.service";
import { TokenService } from "../../domain/services/token.service";
import { TokenRepository } from "../../domain/repositories/token.repository";
import { BadRequestError, UnauthorizedError, ForbiddenError } from "@/app/errors";
import { SigninInputDTO, SigninOutputDTO } from "../dtos/signin.dto";

export class SigninUser {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly passwordService: PasswordService,
        private readonly tokenService: TokenService,
        private readonly tokenRepository: TokenRepository
    ) { }

    async execute(input: SigninInputDTO): Promise<SigninOutputDTO> {
        const email = input.email.toLowerCase().trim();

        // 1. Find user by email
        const user = await this.userRepository.findByEmail(email);
        if (!user) {
            throw new UnauthorizedError("Invalid email or password");
        }

        // 2. Check if account is blocked
        if (user.isBlocked) {
            throw new ForbiddenError("Your account has been blocked. Please contact support.");
        }

        // 3. Enforce strict role matching if a specific portal role was requested
        if (input.role && user.role !== input.role) {
            if (user.role === "TEACHER") {
                throw new ForbiddenError("This account is registered as a Teacher. Please sign in through the Teacher portal.");
            } else if (user.role === "STUDENT") {
                throw new ForbiddenError("This account is registered as a Student. Please sign in through the Student portal.");
            } else if (user.role === "ADMIN") {
                throw new ForbiddenError("This account is registered as an Administrator. Please sign in through the Admin portal.");
            } else {
                throw new ForbiddenError(`Access denied. Your account does not have ${input.role.toLowerCase()} privileges.`);
            }
        }

        // 4. Check if user is password-based or OAuth-only
        if (!user.password) {
            if (user.authProvider === "GOOGLE") {
                throw new BadRequestError("This account was created with Google. Please sign in with Google.");
            }
            throw new UnauthorizedError("Invalid email or password");
        }

        // 3. Compare password
        const isPasswordValid = await this.passwordService.compare(input.password, user.password);
        if (!isPasswordValid) {
            throw new UnauthorizedError("Invalid email or password");
        }

        // 4. Generate Access & Refresh tokens
        const tokens = this.tokenService.generateAuthTokens({
            userId: user.id,
            email: user.email,
            role: user.role,
        });

        // 5. Save Refresh Token in Redis session storage
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
