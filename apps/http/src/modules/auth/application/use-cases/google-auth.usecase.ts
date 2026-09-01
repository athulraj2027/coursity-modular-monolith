import { UserRepository, UserRole } from "@/modules/user";
import { OAuthService, OAuthUserProfile } from "../../domain/services/oauth.service";
import { TokenService } from "../../domain/services/token.service";
import { TokenRepository } from "../../domain/repositories/token.repository";
import { BadRequestError } from "@/app/errors";
import { GoogleAuthOutputDTO, GoogleAuthUrlOutputDTO, GoogleLoginInputDTO } from "../dtos/google-auth.dto";

export class GoogleAuth {
    constructor(
        private readonly oauthService: OAuthService,
        private readonly userRepository: UserRepository,
        private readonly tokenService: TokenService,
        private readonly tokenRepository: TokenRepository
    ) { }

    getAuthUrl(state?: string): GoogleAuthUrlOutputDTO {
        const url = this.oauthService.getAuthorizationUrl(state);
        return { url };
    }

    private async handleProfileLogin(profile: OAuthUserProfile, requestedRole?: UserRole): Promise<GoogleAuthOutputDTO> {
        let user = await this.userRepository.findByEmail(profile.email);

        if (!user) {
            // Register new Google-authenticated user
            user = await this.userRepository.create({
                name: profile.name,
                email: profile.email,
                password: null,
                role: requestedRole || "STUDENT",
                authProvider: "GOOGLE",
                isEmailVerified: profile.emailVerified ?? true,
            });
        } else if (!user.isEmailVerified && profile.emailVerified) {
            // Verify email if it was previously unverified
            user = await this.userRepository.update(user.id, {
                isEmailVerified: true,
            });
        }

        // Issue auth tokens
        const tokens = this.tokenService.generateAuthTokens({
            userId: user.id,
            email: user.email,
            role: user.role,
        });

        // Store refresh token in Redis
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

    async execute(input: GoogleLoginInputDTO): Promise<GoogleAuthOutputDTO> {
        const token = input.idToken || input.credential;

        if (token) {
            const profile = await this.oauthService.verifyIdToken(token);
            return this.handleProfileLogin(profile, input.role);
        }

        if (input.code) {
            const profile = await this.oauthService.exchangeCodeForProfile(input.code);
            return this.handleProfileLogin(profile, input.role);
        }

        throw new BadRequestError("Google idToken, credential, or code is required");
    }

    async handleCallback(code: string, role?: UserRole): Promise<GoogleAuthOutputDTO> {
        if (!code) {
            throw new BadRequestError("Authorization code is required");
        }

        const profile = await this.oauthService.exchangeCodeForProfile(code);
        return this.handleProfileLogin(profile, role);
    }
}
