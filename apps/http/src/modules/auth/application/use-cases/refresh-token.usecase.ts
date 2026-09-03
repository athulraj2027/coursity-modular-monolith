import { UserRepository } from "@/modules/user";
import { TokenService } from "../../domain/services/token.service";
import { TokenRepository } from "../../domain/repositories/token.repository";
import { UnauthorizedError } from "@/app/errors";
import { RefreshTokenInputDTO, RefreshTokenOutputDTO } from "../dtos/refresh-token.dto";

export class RefreshToken {
    constructor(
        private readonly tokenService: TokenService,
        private readonly tokenRepository: TokenRepository,
        private readonly userRepository: UserRepository
    ) { }

    async execute(input: RefreshTokenInputDTO): Promise<RefreshTokenOutputDTO> {
        if (!input.refreshToken) {
            throw new UnauthorizedError("Refresh token is required");
        }

        // 1. Verify cryptographic validity of Refresh Token
        const payload = this.tokenService.verifyRefreshToken(input.refreshToken);

        // 2. Check if token is present and valid in Redis session store
        const storedToken = await this.tokenRepository.getRefreshToken(payload.userId);
        if (!storedToken || storedToken !== input.refreshToken) {
            throw new UnauthorizedError("Refresh token has expired or been revoked. Please sign in again.");
        }

        // 3. Ensure user exists
        let user = await this.userRepository.findById(payload.userId);
        if (!user) {
            user = await this.userRepository.findByEmail(payload.email);
        }

        if (!user) {
            throw new UnauthorizedError("User no longer exists");
        }

        // 4. Issue new Access Token and rotated Refresh Token
        const newTokens = this.tokenService.generateAuthTokens({
            userId: user.id || payload.userId,
            email: user.email,
            role: user.role,
        });

        // 5. Update Redis with new Refresh Token
        await this.tokenRepository.saveRefreshToken(user.id || payload.userId, newTokens.refreshToken);

        return {
            accessToken: newTokens.accessToken,
            refreshToken: newTokens.refreshToken,
            user: {
                id: user.id || payload.userId,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        };
    }
}
