import type { UserRole } from "@/modules/user/domain/entities/user.entity";

export interface RefreshTokenInputDTO {
    refreshToken?: string;
}

export interface RefreshTokenOutputDTO {
    accessToken: string;
    refreshToken: string;
    user: {
        id: string;
        name: string;
        email: string;
        role: UserRole;
    };
}

export type RefreshTokenInput = RefreshTokenInputDTO;
export type RefreshTokenOutput = RefreshTokenOutputDTO;
