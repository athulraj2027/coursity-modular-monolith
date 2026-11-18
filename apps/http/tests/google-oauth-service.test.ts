import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { GoogleOAuthService, GoogleOAuthConfig } from "../src/modules/auth/infrastructure/oauth/google-oauth.service";
import { BadRequestError, UnauthorizedError } from "../src/app/errors";

describe("GoogleOAuthService (SOLID & Clean Architecture Unit Tests)", () => {
    const mockConfig: GoogleOAuthConfig = {
        clientId: "test-client-id.apps.googleusercontent.com",
        clientSecret: "test-client-secret",
        redirectUri: "https://coursity.example.com/api/auth/google/callback",
    };

    describe("Dependency Inversion & Open/Closed Principle", () => {
        it("should accept injected configuration instead of relying on global env", () => {
            const service = new GoogleOAuthService(mockConfig);
            const url = service.getAuthorizationUrl();

            assert.match(url, /client_id=test-client-id\.apps\.googleusercontent\.com/);
            assert.match(url, /redirect_uri=https%3A%2F%2Fcoursity\.example\.com%2Fapi%2Fauth%2Fgoogle%2Fcallback/);
        });

        it("should support custom endpoints via configuration (Open/Closed Principle)", () => {
            const customEndpointsService = new GoogleOAuthService({
                ...mockConfig,
                endpoints: {
                    authUrl: "https://custom-auth.example.com/oauth2",
                },
            });

            const url = customEndpointsService.getAuthorizationUrl();
            assert.ok(url.startsWith("https://custom-auth.example.com/oauth2?"));
        });
    });

    describe("getAuthorizationUrl", () => {
        it("should format Google OAuth authorization URL with required parameters", () => {
            const service = new GoogleOAuthService(mockConfig);
            const url = service.getAuthorizationUrl("custom_state_123");

            const parsed = new URL(url);
            assert.equal(parsed.origin + parsed.pathname, "https://accounts.google.com/o/oauth2/v2/auth");
            assert.equal(parsed.searchParams.get("client_id"), mockConfig.clientId);
            assert.equal(parsed.searchParams.get("redirect_uri"), mockConfig.redirectUri);
            assert.equal(parsed.searchParams.get("response_type"), "code");
            assert.equal(parsed.searchParams.get("scope"), "openid email profile");
            assert.equal(parsed.searchParams.get("state"), "custom_state_123");
            assert.equal(parsed.searchParams.get("access_type"), "offline");
            assert.equal(parsed.searchParams.get("prompt"), "consent");
        });
    });

    describe("verifyIdToken", () => {
        it("should throw BadRequestError when token is empty or whitespace", async () => {
            const service = new GoogleOAuthService(mockConfig);
            await assert.rejects(
                () => service.verifyIdToken("   "),
                (err: any) => err instanceof BadRequestError && err.message === "Google ID token is required"
            );
        });

        it("should successfully verify token and map to OAuthUserProfile using injected fetcher", async () => {
            const mockFetcher: typeof fetch = async (url) => {
                assert.ok(String(url).includes("id_token=valid_token_abc"));
                return new Response(
                    JSON.stringify({
                        sub: "google_user_999",
                        email: "Student.One@Example.com",
                        name: "Student One",
                        picture: "https://example.com/photo.jpg",
                        email_verified: "true",
                    }),
                    { status: 200, headers: { "Content-Type": "application/json" } }
                );
            };

            const service = new GoogleOAuthService(mockConfig, mockFetcher);
            const profile = await service.verifyIdToken("valid_token_abc");

            assert.equal(profile.id, "google_user_999");
            assert.equal(profile.email, "student.one@example.com"); // normalized to lowercase
            assert.equal(profile.name, "Student One");
            assert.equal(profile.picture, "https://example.com/photo.jpg");
            assert.equal(profile.emailVerified, true);
        });

        it("should throw UnauthorizedError when Google tokeninfo returns an error", async () => {
            const mockFetcher: typeof fetch = async () => {
                return new Response(
                    JSON.stringify({
                        error_description: "Invalid Value: token expired",
                    }),
                    { status: 400, headers: { "Content-Type": "application/json" } }
                );
            };

            const service = new GoogleOAuthService(mockConfig, mockFetcher);
            await assert.rejects(
                () => service.verifyIdToken("expired_token"),
                (err: any) => err instanceof UnauthorizedError && err.message === "Invalid Value: token expired"
            );
        });

        it("should throw BadRequestError when Google payload does not provide email", async () => {
            const mockFetcher: typeof fetch = async () => {
                return new Response(
                    JSON.stringify({
                        sub: "google_user_999",
                        name: "Anonymous User",
                    }),
                    { status: 200, headers: { "Content-Type": "application/json" } }
                );
            };

            const service = new GoogleOAuthService(mockConfig, mockFetcher);
            await assert.rejects(
                () => service.verifyIdToken("token_no_email"),
                (err: any) => err instanceof BadRequestError && err.message === "Google account does not provide an email"
            );
        });
    });

    describe("exchangeCodeForProfile", () => {
        it("should throw BadRequestError when code is empty", async () => {
            const service = new GoogleOAuthService(mockConfig);
            await assert.rejects(
                () => service.exchangeCodeForProfile(""),
                (err: any) => err instanceof BadRequestError && err.message === "Authorization code is required"
            );
        });

        it("should exchange code, verify id_token if returned, and return profile", async () => {
            const mockFetcher: typeof fetch = async (url) => {
                const urlStr = String(url);

                if (urlStr.includes("/tokeninfo")) {
                    return new Response(
                        JSON.stringify({
                            sub: "google_sub_123",
                            email: "exchanged@example.com",
                            name: "Exchanged User",
                            picture: "https://example.com/avatar.png",
                            email_verified: true,
                        }),
                        { status: 200, headers: { "Content-Type": "application/json" } }
                    );
                }

                if (urlStr.includes("/token")) {
                    return new Response(
                        JSON.stringify({
                            access_token: "access_token_xyz",
                            id_token: "id_token_xyz",
                        }),
                        { status: 200, headers: { "Content-Type": "application/json" } }
                    );
                }

                throw new Error(`Unexpected request to ${urlStr}`);
            };

            const service = new GoogleOAuthService(mockConfig, mockFetcher);
            const profile = await service.exchangeCodeForProfile("valid_auth_code");

            assert.equal(profile.id, "google_sub_123");
            assert.equal(profile.email, "exchanged@example.com");
            assert.equal(profile.name, "Exchanged User");
            assert.equal(profile.emailVerified, true);
        });

        it("should fallback to userinfo endpoint if id_token is not present in token exchange response", async () => {
            const mockFetcher: typeof fetch = async (url) => {
                const urlStr = String(url);

                if (urlStr.includes("/userinfo")) {
                    return new Response(
                        JSON.stringify({
                            sub: "userinfo_sub_456",
                            email: "userinfo@example.com",
                            name: "UserInfo User",
                            picture: "https://example.com/userinfo.jpg",
                            email_verified: true,
                        }),
                        { status: 200, headers: { "Content-Type": "application/json" } }
                    );
                }

                if (urlStr.includes("/token")) {
                    return new Response(
                        JSON.stringify({
                            access_token: "access_token_abc",
                        }),
                        { status: 200, headers: { "Content-Type": "application/json" } }
                    );
                }

                throw new Error(`Unexpected request to ${urlStr}`);
            };

            const service = new GoogleOAuthService(mockConfig, mockFetcher);
            const profile = await service.exchangeCodeForProfile("valid_code_access_only");

            assert.equal(profile.id, "userinfo_sub_456");
            assert.equal(profile.email, "userinfo@example.com");
            assert.equal(profile.name, "UserInfo User");
        });

        it("should try 'postmessage' first, and fallback to redirectUri if 'postmessage' fails", async () => {
            const triedRedirectUris: string[] = [];

            const mockFetcher: typeof fetch = async (url, options) => {
                const urlStr = String(url);

                if (urlStr.includes("/tokeninfo")) {
                    return new Response(
                        JSON.stringify({
                            sub: "fallback_sub_789",
                            email: "fallback@example.com",
                            name: "Fallback User",
                            email_verified: true,
                        }),
                        { status: 200, headers: { "Content-Type": "application/json" } }
                    );
                }

                if (urlStr.includes("/token")) {
                    const body = new URLSearchParams(options?.body as string);
                    const attemptedUri = body.get("redirect_uri") || "";
                    triedRedirectUris.push(attemptedUri);

                    if (attemptedUri === "postmessage") {
                        // Fail postmessage
                        return new Response(
                            JSON.stringify({ error_description: "redirect_uri_mismatch" }),
                            { status: 400, headers: { "Content-Type": "application/json" } }
                        );
                    }

                    if (attemptedUri === mockConfig.redirectUri) {
                        // Succeed on configured redirectUri
                        return new Response(
                            JSON.stringify({
                                access_token: "access_token_redirect",
                                id_token: "id_token_redirect",
                            }),
                            { status: 200, headers: { "Content-Type": "application/json" } }
                        );
                    }
                }

                throw new Error(`Unexpected URL: ${urlStr}`);
            };

            const service = new GoogleOAuthService(mockConfig, mockFetcher);
            const profile = await service.exchangeCodeForProfile("code_requiring_fallback");

            assert.deepEqual(triedRedirectUris, ["postmessage", mockConfig.redirectUri]);
            assert.equal(profile.id, "fallback_sub_789");
            assert.equal(profile.email, "fallback@example.com");
        });
    });
});
