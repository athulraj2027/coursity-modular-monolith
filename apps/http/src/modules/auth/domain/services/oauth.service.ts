import { IOAuthService } from "./oauth.service.interface";
import { OAuthUserProfile } from "../entities/oauth-user-profile.entity";

export * from "./oauth.service.interface";
export * from "../entities/oauth-user-profile.entity";

export abstract class OAuthService implements IOAuthService {
    abstract getAuthorizationUrl(state?: string): string;
    abstract verifyIdToken(idToken: string): Promise<OAuthUserProfile>;
    abstract exchangeCodeForProfile(code: string): Promise<OAuthUserProfile>;
}
