export interface LogoutInputDTO {
    refreshToken?: string;
    userId?: string;
}

export interface LogoutOutputDTO {
    message: string;
}

export type LogoutInput = LogoutInputDTO;
export type LogoutOutput = LogoutOutputDTO;
