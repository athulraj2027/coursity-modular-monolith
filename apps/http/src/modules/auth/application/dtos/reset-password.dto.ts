export interface ResetPasswordInputDTO {
    email: string;
    otp: string;
    newPassword: string;
}

export interface ResetPasswordOutputDTO {
    message: string;
}

export type ResetPasswordInput = ResetPasswordInputDTO;
export type ResetPasswordOutput = ResetPasswordOutputDTO;
