import { UserRepository } from "@/modules/user/domain/repositories/user.repository";
import type { UserRole } from "@/modules/user/domain/entities/user.entity";
import { IOAuthService } from "../../domain/services/oauth.service.interface";
import { OAuthUserProfile } from "../../domain/entities/oauth-user-profile.entity";
import { ITokenGenerator } from "@/infrastructure/security";
import { ISaveRefreshTokenRepository } from "../../domain/repositories/token.repository";
import { BadRequestError, ForbiddenError } from "@/app/errors";
import { GoogleAuthOutputDTO, GoogleAuthUrlOutputDTO, GoogleLoginInputDTO } from "../dtos/google-auth.dto";
import { PortalAccessPolicy } from "../../domain/policies/portal-access.policy";

export class GoogleAuth {
    constructor(
        private readonly oauthService: IOAuthService,
        private readonly userRepository: UserRepository,
        private readonly tokenService: ITokenGenerator,
        private readonly tokenRepository: ISaveRefreshTokenRepository
    ) { }

    getAuthUrl(state?: string): GoogleAuthUrlOutputDTO {
        const url = this.oauthService.getAuthorizationUrl(state);
        return { url };
    }

    private async handleProfileLogin(profile: OAuthUserProfile, requestedRole?: UserRole): Promise<GoogleAuthOutputDTO> {
        let user = await this.userRepository.findByGoogleId(profile.id);

        if (!user) {
            user = await this.userRepository.findByEmail(profile.email);
            if (user && !user.googleId) {
                user = await this.userRepository.update(user.id, {
                    googleId: profile.id,
                    authProvider: "GOOGLE",
                });
            }
        }

        if (!user) {
            if (requestedRole === "ADMIN") {
                throw new ForbiddenError("Administrator accounts cannot be created via Google authentication.");
            }
            // Register new Google-authenticated user
            user = await this.userRepository.create({
                name: profile.name,
                email: profile.email,
                password: null,
                role: requestedRole || "STUDENT",
                authProvider: "GOOGLE",
                googleId: profile.id,
            });
        } else {
            // 1. Check if account is blocked
            if (user.isBlocked) {
                throw new ForbiddenError("Your account has been blocked. Please contact support.");
            }

            // 2. Enforce strict role matching via PortalAccessPolicy (OCP)
            PortalAccessPolicy.assertPortalRoleAccess(user.role, requestedRole, "signin");
        }

        // Issue auth tokens
        const tokens = this.tokenService.generateAuthTokens({
            userId: user.id,
            email: user.email,
            role: user.role,
        });

        // Store refresh token in session storage
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
