import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
    CryptoOtpGeneratorService,
    OtpCooldownPolicy,
    PortalAccessPolicy,
    SignupUser,
    SigninUser,
    LogoutUser,
    ResetPassword,
    ForgotPassword,
    ISignupOtpRepository,
    IPasswordResetOtpRepository,
    ISaveRefreshTokenRepository,
    IDeleteRefreshTokenRepository,
    IOtpGenerator,
    StoredOtpData,
    StoredResetPasswordOtpData,
} from "../src/modules/auth";
import { IPasswordHasher, IPasswordComparer, ITokenGenerator, ITokenVerifier } from "@/infrastructure/security";
import { UserRepository, User } from "@/modules/user/domain/repositories/user.repository";
import { BadRequestError, ForbiddenError } from "../src/app/errors";

describe("Auth Module SOLID Principles Unit Tests", () => {
    describe("1. Single Responsibility: CryptoOtpGeneratorService", () => {
        it("should generate cryptographically secure numeric OTPs of default length 6", () => {
            const generator: IOtpGenerator = new CryptoOtpGeneratorService();
            const otp1 = generator.generate();
            const otp2 = generator.generate();

            assert.equal(typeof otp1, "string");
            assert.equal(otp1.length, 6);
            assert.ok(/^\d{6}$/.test(otp1), "OTP should be 6 digits");
            assert.ok(/^\d{6}$/.test(otp2), "OTP should be 6 digits");
            assert.notEqual(otp1, otp2, "Consecutive OTPs should be distinct");
        });

        it("should generate OTPs with configurable length", () => {
            const generator: IOtpGenerator = new CryptoOtpGeneratorService();
            const otp4 = generator.generate(4);
            const otp8 = generator.generate(8);

            assert.equal(otp4.length, 4);
            assert.equal(otp8.length, 8);
        });
    });

    describe("2. Single Responsibility: OtpCooldownPolicy", () => {
        it("should pass when no prior creation timestamp is present", () => {
            assert.doesNotThrow(() => {
                OtpCooldownPolicy.assertCooldownElapsed(undefined);
            });
        });

        it("should pass when cooldown period has elapsed", () => {
            const twoMinutesAgo = Date.now() - 120 * 1000;
            assert.doesNotThrow(() => {
                OtpCooldownPolicy.assertCooldownElapsed(twoMinutesAgo, 60 * 1000);
            });
        });

        it("should throw BadRequestError when cooldown has not elapsed", () => {
            const thirtySecondsAgo = Date.now() - 30 * 1000;
            assert.throws(() => {
                OtpCooldownPolicy.assertCooldownElapsed(thirtySecondsAgo, 60 * 1000);
            }, BadRequestError);
        });
    });

    describe("3. Open/Closed Principle: PortalAccessPolicy", () => {
        it("should allow matching role or undefined portal role", () => {
            assert.doesNotThrow(() => {
                PortalAccessPolicy.assertPortalRoleAccess("STUDENT", "STUDENT");
                PortalAccessPolicy.assertPortalRoleAccess("TEACHER", undefined);
            });
        });

        it("should throw ForbiddenError with portal instructions for signin role mismatch", () => {
            assert.throws(() => {
                PortalAccessPolicy.assertPortalRoleAccess("TEACHER", "STUDENT", "signin");
            }, (err: any) => {
                return err instanceof ForbiddenError && err.message.includes("Teacher portal");
            });

            assert.throws(() => {
                PortalAccessPolicy.assertPortalRoleAccess("ADMIN", "STUDENT", "signin");
            }, (err: any) => {
                return err instanceof ForbiddenError && err.message.includes("Admin portal");
            });
        });

        it("should throw BadRequestError with portal instructions for reset-password role mismatch", () => {
            assert.throws(() => {
                PortalAccessPolicy.assertPortalRoleAccess("STUDENT", "TEACHER", "reset-password");
            }, (err: any) => {
                return err instanceof BadRequestError && err.message.includes("Student portal");
            });
        });
    });

    describe("4. Interface Segregation: Fine-Grained Ports in Use Cases", () => {
        it("SignupUser should only require IPasswordHasher, ISignupOtpRepository, and IOtpGenerator", async () => {
            const savedOtps: Record<string, string> = {};
            const mockOtpRepo: ISignupOtpRepository = {
                async saveSignupOtp(email, otp, data) {
                    savedOtps[email] = otp;
                },
                async getSignupOtp(email) {
                    return null;
                },
                async deleteSignupOtp(email) {
                    delete savedOtps[email];
                },
            };

            const mockHasher: IPasswordHasher = {
                async hash(pwd: string) {
                    return `hashed_${pwd}`;
                },
            };

            const mockGenerator: IOtpGenerator = {
                generate: () => "999888",
            };

            const mockUserRepo = {
                async findByEmail() {
                    return null;
                },
            } as unknown as UserRepository;

            const useCase = new SignupUser(
                mockUserRepo,
                mockHasher,
                mockOtpRepo,
                undefined,
                mockGenerator
            );

            const result = await useCase.execute({
                name: "John Doe",
                email: "john@example.com",
                password: "SecurePassword1!",
                role: "STUDENT",
            });

            assert.equal(result.email, "john@example.com");
            assert.equal(savedOtps["john@example.com"], "999888");
        });

        it("SigninUser should only require IPasswordComparer, ITokenGenerator, and ISaveRefreshTokenRepository", async () => {
            const mockComparer: IPasswordComparer = {
                async compare(plain, hashed) {
                    return plain === "CorrectPassword!";
                },
            };

            const mockTokenGen: ITokenGenerator = {
                generateAccessToken: () => "access_token_xyz",
                generateRefreshToken: () => "refresh_token_xyz",
                generateAuthTokens: () => ({
                    accessToken: "access_token_xyz",
                    refreshToken: "refresh_token_xyz",
                }),
            };

            let savedToken: string | null = null;
            const mockTokenRepo: ISaveRefreshTokenRepository = {
                async saveRefreshToken(userId, token) {
                    savedToken = token;
                },
            };

            const mockUserRepo = {
                async findByEmail() {
                    return {
                        id: "user_1",
                        name: "Alice",
                        email: "alice@example.com",
                        password: "hashed_password",
                        role: "STUDENT",
                        authProvider: "LOCAL",
                        isBlocked: false,
                    } as User;
                },
            } as unknown as UserRepository;

            const useCase = new SigninUser(
                mockUserRepo,
                mockComparer,
                mockTokenGen,
                mockTokenRepo
            );

            const result = await useCase.execute({
                email: "alice@example.com",
                password: "CorrectPassword!",
                role: "STUDENT",
            });

            assert.equal(result.accessToken, "access_token_xyz");
            assert.equal(savedToken, "refresh_token_xyz");
        });

        it("LogoutUser should only require IDeleteRefreshTokenRepository and ITokenVerifier", async () => {
            let deletedUserId: string | null = null;
            const mockTokenRepo: IDeleteRefreshTokenRepository = {
                async deleteRefreshToken(userId) {
                    deletedUserId = userId;
                },
            };

            const mockVerifier: ITokenVerifier = {
                verifyAccessToken: () => ({} as any),
                verifyRefreshToken: (token) => ({
                    userId: "user_verified_99",
                    email: "u@example.com",
                    role: "STUDENT",
                }),
            };

            const useCase = new LogoutUser(mockTokenRepo, mockVerifier);
            const result = await useCase.execute({ refreshToken: "valid_refresh_token" });

            assert.equal(result.message, "Logged out successfully");
            assert.equal(deletedUserId, "user_verified_99");
        });
    });
});

