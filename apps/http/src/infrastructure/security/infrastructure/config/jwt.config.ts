import { env } from "@/app/config/env";

export interface JwtConfig {
    secret: string;
    refreshSecret: string;
    accessExpiresIn: string;
    refreshExpiresIn: string;
}

export const defaultJwtConfig: JwtConfig = {
    secret: env.JWT_SECRET,
    refreshSecret: env.JWT_REFRESH_SECRET || env.JWT_SECRET,
    accessExpiresIn: env.JWT_ACCESS_EXPIRES_IN || "15m",
    refreshExpiresIn: env.JWT_REFRESH_EXPIRES_IN || "7d",
};

export const getJwtConfig = (override?: Partial<JwtConfig>): JwtConfig => ({
    ...defaultJwtConfig,
    ...override,
});

