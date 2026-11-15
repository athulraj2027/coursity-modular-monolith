import { IOAuthService } from "../../domain/services/oauth.service.interface";
import { OAuthService } from "../../domain/services/oauth.service";
import { OAuthUserProfile } from "../../domain/entities/oauth-user-profile.entity";
import { BadRequestError, UnauthorizedError } from "@/app/errors";

export interface GoogleOAuthEndpoints {
    authUrl?: string;
    tokenInfoUrl?: string;
    tokenUrl?: string;
    userInfoUrl?: string;
}

export interface GoogleOAuthConfig {
    clientId: string;
    clientSecret: string;
    redirectUri: string;
    endpoints?: GoogleOAuthEndpoints;
}

export interface GoogleTokenInfoResponse {
    sub: string;
    email: string;
    name?: string;
    picture?: string;
    email_verified?: string | boolean;
    aud?: string;
    error_description?: string;
}

export interface GoogleTokenResponse {
    access_token: string;
    id_token?: string;
    expires_in?: number;
    token_type?: string;
    scope?: string;
    refresh_token?: string;
}

export interface GoogleUserInfoResponse {
    sub: string;
    email: string;
    name?: string;
    picture?: string;
    email_verified?: boolean;
}

export interface GoogleOAuthErrorResponse {
    error?: string;
    error_description?: string;
    message?: string;
}

export class GoogleOAuthService extends OAuthService implements IOAuthService {
    private readonly clientId: string;
    private readonly clientSecret: string;
    private readonly redirectUri: string;
    private readonly authUrl: string;
    private readonly tokenInfoUrl: string;
    private readonly tokenUrl: string;
    private readonly userInfoUrl: string;
    private readonly fetcher: typeof fetch;

    constructor(
        config: Partial<GoogleOAuthConfig> = {},
        fetcher: typeof fetch = fetch
    ) {
        super();
        this.clientId = config.clientId ?? "";
        this.clientSecret = config.clientSecret ?? "";
        this.redirectUri = config.redirectUri ?? "http://localhost:3000/api/auth/google/callback";
        this.authUrl = config.endpoints?.authUrl ?? "https://accounts.google.com/o/oauth2/v2/auth";
        this.tokenInfoUrl = config.endpoints?.tokenInfoUrl ?? "https://oauth2.googleapis.com/tokeninfo";
        this.tokenUrl = config.endpoints?.tokenUrl ?? "https://oauth2.googleapis.com/token";
        this.userInfoUrl = config.endpoints?.userInfoUrl ?? "https://www.googleapis.com/oauth2/v3/userinfo";
        this.fetcher = fetcher;
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

        return `${this.authUrl}?${params.toString()}`;
    }

    async verifyIdToken(idToken: string): Promise<OAuthUserProfile> {
        if (!idToken || !idToken.trim()) {
            throw new BadRequestError("Google ID token is required");
        }

        try {
            const response = await this.fetcher(
                `${this.tokenInfoUrl}?id_token=${encodeURIComponent(idToken)}`
            );
            const data = await this.parseJsonResponse<GoogleTokenInfoResponse & GoogleOAuthErrorResponse>(response);

            if (!response.ok) {
                throw new UnauthorizedError(data?.error_description || "Invalid Google ID token");
            }

            if (!data) {
                throw new UnauthorizedError("Failed to parse Google ID token response");
            }

            return this.mapTokenInfoToProfile(data);
        } catch (error) {
            if (error instanceof UnauthorizedError || error instanceof BadRequestError) {
                throw error;
            }
            throw new UnauthorizedError("Failed to verify Google ID token");
        }
    }

    async exchangeCodeForProfile(code: string): Promise<OAuthUserProfile> {
        if (!code || !code.trim()) {
            throw new BadRequestError("Authorization code is required");
        }

        try {
            const tokenData = await this.fetchAccessToken(code);

            // If id_token is provided, verify it directly
            if (tokenData.id_token) {
                return await this.verifyIdToken(tokenData.id_token);
            }

            // Otherwise, fetch userinfo using access_token
            return await this.fetchUserProfile(tokenData.access_token);
        } catch (error) {
            if (error instanceof UnauthorizedError || error instanceof BadRequestError) {
                throw error;
            }
            throw new BadRequestError("Failed to complete Google OAuth authentication");
        }
    }

    private async fetchAccessToken(code: string): Promise<GoogleTokenResponse> {
        // GIS popup uses "postmessage", whereas standard redirect OAuth uses this.redirectUri
        const urisToTry = ["postmessage", this.redirectUri];
        let lastErrorData: GoogleOAuthErrorResponse | null = null;

        for (const redirectUri of urisToTry) {
            const response = await this.fetcher(this.tokenUrl, {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: new URLSearchParams({
                    code,
                    client_id: this.clientId,
                    client_secret: this.clientSecret,
                    redirect_uri: redirectUri,
                    grant_type: "authorization_code",
                }).toString(),
            });

            const parsedBody = await this.parseJsonResponse<GoogleTokenResponse & GoogleOAuthErrorResponse>(response);

            if (response.ok && parsedBody?.access_token) {
                return parsedBody;
            } else {
                lastErrorData = parsedBody;
            }
        }

        throw new BadRequestError(
            lastErrorData?.error_description || "Failed to exchange authorization code with Google"
        );
    }

    private async fetchUserProfile(accessToken: string): Promise<OAuthUserProfile> {
        const response = await this.fetcher(this.userInfoUrl, {
            headers: { Authorization: `Bearer ${accessToken}` },
        });

        const userData = await this.parseJsonResponse<GoogleUserInfoResponse & GoogleOAuthErrorResponse>(response);

        if (!response.ok) {
            throw new UnauthorizedError(userData?.error_description || "Failed to fetch Google user profile");
        }

        if (!userData) {
            throw new UnauthorizedError("Failed to parse Google user profile response");
        }

        return this.mapUserInfoToProfile(userData);
    }

    private mapTokenInfoToProfile(data: GoogleTokenInfoResponse): OAuthUserProfile {
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
    }

    private mapUserInfoToProfile(userData: GoogleUserInfoResponse): OAuthUserProfile {
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
    }

    private async parseJsonResponse<T>(response: Response): Promise<T | null> {
        try {
            return (await response.json()) as T;
        } catch {
            return null;
        }
    }
}
