import { OAuthUserProfile } from "../entities/oauth-user-profile.entity";

export interface IOAuthService {
    getAuthorizationUrl(state?: string): string;
    verifyIdToken(idToken: string): Promise<OAuthUserProfile>;
    exchangeCodeForProfile(code: string): Promise<OAuthUserProfile>;
}

