import { OAuthService, OAuthUserProfile } from "../../domain/services/oauth.service";
import { env } from "@/app/config/env";
import { BadRequestError, UnauthorizedError } from "@/app/errors";

export class GoogleOAuthService implements OAuthService {
    private readonly clientId: string;
    private readonly clientSecret: string;
    private readonly redirectUri: string;

    constructor() {
        this.clientId = env.GOOGLE_CLIENT_ID || "";
        this.clientSecret = env.GOOGLE_CLIENT_SECRET || "";
        this.redirectUri = env.GOOGLE_REDIRECT_URI || "http://localhost:3000/api/auth/google/callback";
    }

    getAuthorizationUrl(state?: string): string {
        const params = new URLSearchParams({
            client_id: this.clientId,
            redirect_uri: this.redirectUri,
            response_type: "code",
            scope: "openid email profile",
            access_type: "offline",
            prompt: "consent",
            ...(state ? { state } : {}),
        });

        return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
    }

    async verifyIdToken(idToken: string): Promise<OAuthUserProfile> {
        try {
            const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`);
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new UnauthorizedError(errorData.error_description || "Invalid Google ID token");
            }

            const data = await response.json() as {
                sub: string;
                email: string;
                name?: string;
                picture?: string;
                email_verified?: string | boolean;
                aud?: string;
            };

            if (!data.email) {
                throw new BadRequestError("Google account does not provide an email");
            }

            const isEmailVerified = data.email_verified === "true" || data.email_verified === true;

            return {
                id: data.sub,
                email: data.email.toLowerCase().trim(),
                name: data.name || data.email.split("@")[0],
                picture: data.picture,
                emailVerified: isEmailVerified,
            };
        } catch (error) {
            if (error instanceof UnauthorizedError || error instanceof BadRequestError) {
                throw error;
            }
            throw new UnauthorizedError("Failed to verify Google ID token");
        }
    }

    async exchangeCodeForProfile(code: string): Promise<OAuthUserProfile> {
        try {
            const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: new URLSearchParams({
                    code,
                    client_id: this.clientId,
                    client_secret: this.clientSecret,
                    redirect_uri: this.redirectUri,
                    grant_type: "authorization_code",
                }).toString(),
            });

            if (!tokenResponse.ok) {
                const errorData = await tokenResponse.json().catch(() => ({}));
                throw new BadRequestError(errorData.error_description || "Failed to exchange authorization code with Google");
            }

            const tokenData = await tokenResponse.json() as {
                access_token: string;
                id_token?: string;
            };

            // If id_token is provided, verify it directly
            if (tokenData.id_token) {
                return this.verifyIdToken(tokenData.id_token);
            }

            // Otherwise, fetch userinfo using access_token
            const userInfoResponse = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
                headers: { Authorization: `Bearer ${tokenData.access_token}` },
            });

            if (!userInfoResponse.ok) {
                throw new UnauthorizedError("Failed to fetch Google user profile");
            }

            const userData = await userInfoResponse.json() as {
                sub: string;
                email: string;
                name?: string;
                picture?: string;
                email_verified?: boolean;
            };

            if (!userData.email) {
                throw new BadRequestError("Google profile missing email");
            }

            return {
                id: userData.sub,
                email: userData.email.toLowerCase().trim(),
                name: userData.name || userData.email.split("@")[0],
                picture: userData.picture,
                emailVerified: userData.email_verified ?? true,
            };
        } catch (error) {
            if (error instanceof UnauthorizedError || error instanceof BadRequestError) {
                throw error;
            }
            throw new BadRequestError("Failed to complete Google OAuth authentication");
        }
    }
}
