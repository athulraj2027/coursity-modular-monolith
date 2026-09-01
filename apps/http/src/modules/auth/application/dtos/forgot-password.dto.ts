export interface ForgotPasswordInputDTO {
    email: string;
}

export interface ForgotPasswordOutputDTO {
    email: string;
    message: string;
}

export type ForgotPasswordInput = ForgotPasswordInputDTO;
export type ForgotPasswordOutput = ForgotPasswordOutputDTO;
