import { TokenRepository } from "../../domain/repositories/token.repository";
import { TokenService } from "../../domain/services/token.service";
import { LogoutInputDTO, LogoutOutputDTO } from "../dtos/logout.dto";

export class LogoutUser {
    constructor(
        private readonly tokenRepository: TokenRepository,
        private readonly tokenService: TokenService
    ) { }

    async execute(input: LogoutInputDTO): Promise<LogoutOutputDTO> {
        let userId = input.userId;

        if (!userId && input.refreshToken) {
            try {
                const payload = this.tokenService.verifyRefreshToken(input.refreshToken);
                userId = payload.userId;
            } catch (e) {
                // If token is invalid or expired, proceed gracefully
            }
        }

        if (userId) {
            await this.tokenRepository.deleteRefreshToken(userId);
        }

        return {
            message: "Logged out successfully",
        };
    }
}
