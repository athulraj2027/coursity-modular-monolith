import { IDeleteRefreshTokenRepository } from "../../domain/repositories/token.repository";
import { ITokenVerifier } from "@/infrastructure/security";
import { LogoutInputDTO, LogoutOutputDTO } from "../dtos/logout.dto";

export class LogoutUser {
    constructor(
        private readonly tokenRepository: IDeleteRefreshTokenRepository,
        private readonly tokenService: ITokenVerifier
    ) { }

    async execute(input: LogoutInputDTO): Promise<LogoutOutputDTO> {
        let userId = input.userId;

        if (!userId && input.refreshToken) {
            try {
                const payload = this.tokenService.verifyRefreshToken(input.refreshToken);
                userId = payload.userId;
            } catch {
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
