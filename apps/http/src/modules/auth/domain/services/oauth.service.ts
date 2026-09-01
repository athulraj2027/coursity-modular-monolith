export interface OAuthUserProfile {
    id: string;
    email: string;
    name: string;
    picture?: string;
    emailVerified: boolean;
}

export interface OAuthService {
    getAuthorizationUrl(state?: string): string;
    verifyIdToken(idToken: string): Promise<OAuthUserProfile>;
    exchangeCodeForProfile(code: string): Promise<OAuthUserProfile>;
}
