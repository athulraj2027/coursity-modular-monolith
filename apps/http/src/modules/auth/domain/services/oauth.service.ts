export interface OAuthUserProfile {
    id: string;
    email: string;
    name: string;
    picture?: string;
    emailVerified: boolean;
}

export abstract class OAuthService {
    abstract getAuthorizationUrl(state?: string): string;
    abstract verifyIdToken(idToken: string): Promise<OAuthUserProfile>;
    abstract exchangeCodeForProfile(code: string): Promise<OAuthUserProfile>;
}

