import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
    IPasswordService,
    ITokenService,
    PasswordService,
    TokenService,
    BcryptPasswordService,
    JwtTokenService,
    passwordService,
    tokenService,
    TokenPayload,
    getJwtConfig,
    getPasswordConfig,
} from "../src/infrastructure/security";
import { UnauthorizedError } from "../src/app/errors";

describe("Security Clean Architecture", () => {
    describe("Layering and Contracts", () => {
        it("should export singleton instances conforming to IPasswordService and ITokenService", () => {
            assert.ok(passwordService instanceof PasswordService);
            assert.ok(typeof passwordService.hash === "function");
            assert.ok(typeof passwordService.compare === "function");

            assert.ok(tokenService instanceof TokenService);
            assert.ok(typeof tokenService.generateAccessToken === "function");
            assert.ok(typeof tokenService.generateRefreshToken === "function");
            assert.ok(typeof tokenService.generateAuthTokens === "function");
            assert.ok(typeof tokenService.verifyAccessToken === "function");
            assert.ok(typeof tokenService.verifyRefreshToken === "function");
        });

        it("should allow creating BcryptPasswordService implementing IPasswordService", () => {
            const customPasswordService: IPasswordService = new BcryptPasswordService({ saltRounds: 4 });
            assert.ok(customPasswordService instanceof PasswordService);
        });

        it("should allow creating JwtTokenService implementing ITokenService", () => {
            const customTokenService: ITokenService = new JwtTokenService({
                secret: "test-secret",
                refreshSecret: "test-refresh-secret",
                accessExpiresIn: "1h",
                refreshExpiresIn: "30d",
            });
            assert.ok(customTokenService instanceof TokenService);
        });
    });

    describe("Password Service Functionality", () => {
        it("should hash and verify passwords correctly", async () => {
            const service = new BcryptPasswordService({ saltRounds: 4 });
            const plain = "SuperSecretPassword123!";

            const hashed = await service.hash(plain);
            assert.ok(hashed.startsWith("$2"), "Hash should be a valid bcrypt hash");
            assert.notEqual(hashed, plain);

            const isMatch = await service.compare(plain, hashed);
            assert.equal(isMatch, true, "Valid password comparison should be true");

            const isWrongMatch = await service.compare("WrongPassword123!", hashed);
            assert.equal(isWrongMatch, false, "Invalid password comparison should be false");
        });

        it("should respect configurable password salt rounds", () => {
            const config = getPasswordConfig({ saltRounds: 8 });
            assert.equal(config.saltRounds, 8);
        });
    });

    describe("Token Service Functionality", () => {
        const payload: TokenPayload = {
            userId: "user-12345",
            email: "student@coursity.com",
            role: "STUDENT",
        };

        it("should generate and verify access tokens", () => {
            const service = new JwtTokenService({
                secret: "access-jwt-secret-xyz",
                refreshSecret: "refresh-jwt-secret-xyz",
                accessExpiresIn: "15m",
                refreshExpiresIn: "7d",
            });

            const token = service.generateAccessToken(payload);
            assert.ok(typeof token === "string" && token.split(".").length === 3);

            const verified = service.verifyAccessToken(token);
            assert.equal(verified.userId, payload.userId);
            assert.equal(verified.email, payload.email);
            assert.equal(verified.role, payload.role);
        });

        it("should generate and verify refresh tokens using refresh secret", () => {
            const service = new JwtTokenService({
                secret: "access-jwt-secret-xyz",
                refreshSecret: "refresh-jwt-secret-xyz",
                accessExpiresIn: "15m",
                refreshExpiresIn: "7d",
            });

            const token = service.generateRefreshToken(payload);
            assert.ok(typeof token === "string" && token.split(".").length === 3);

            const verified = service.verifyRefreshToken(token);
            assert.equal(verified.userId, payload.userId);
            assert.equal(verified.email, payload.email);
            assert.equal(verified.role, payload.role);

            // Access token verification should fail with refresh token because secrets differ
            assert.throws(() => {
                service.verifyAccessToken(token);
            }, UnauthorizedError);
        });

        it("should generate auth token pairs", () => {
            const service = new JwtTokenService({
                secret: "test-secret-pair",
                refreshSecret: "test-refresh-secret-pair",
                accessExpiresIn: "10m",
                refreshExpiresIn: "1d",
            });

            const tokens = service.generateAuthTokens(payload);
            assert.ok(tokens.accessToken);
            assert.ok(tokens.refreshToken);

            const verifiedAccess = service.verifyAccessToken(tokens.accessToken);
            const verifiedRefresh = service.verifyRefreshToken(tokens.refreshToken);

            assert.equal(verifiedAccess.userId, payload.userId);
            assert.equal(verifiedRefresh.userId, payload.userId);
        });

        it("should throw UnauthorizedError when verifying invalid token", () => {
            const service = new JwtTokenService({
                secret: "test-secret-invalid",
                refreshSecret: "test-refresh-secret-invalid",
                accessExpiresIn: "10m",
                refreshExpiresIn: "1d",
            });

            assert.throws(() => {
                service.verifyAccessToken("malformed.token.string");
            }, UnauthorizedError);

            assert.throws(() => {
                service.verifyRefreshToken("malformed.token.string");
            }, UnauthorizedError);
        });

        it("should throw UnauthorizedError when token is expired", async () => {
            const service = new JwtTokenService({
                secret: "test-secret-expired",
                refreshSecret: "test-refresh-secret-expired",
                accessExpiresIn: "1ms",
                refreshExpiresIn: "1ms",
            });

            const token = service.generateAccessToken(payload);
            // Wait 20ms for token to expire
            await new Promise((resolve) => setTimeout(resolve, 20));

            assert.throws(() => {
                service.verifyAccessToken(token);
            }, UnauthorizedError);
        });

        it("should support dependency-injected JwtConfig", () => {
            const config = getJwtConfig({
                secret: "custom-secret",
                accessExpiresIn: "2h",
            });

            assert.equal(config.secret, "custom-secret");
            assert.equal(config.accessExpiresIn, "2h");
            assert.ok(config.refreshSecret);
        });
    });
});

