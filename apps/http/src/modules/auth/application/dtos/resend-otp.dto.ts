export interface ResendOtpInputDTO {
    email: string;
}

export interface ResendOtpOutputDTO {
    email: string;
    message: string;
}

export type ResendOtpInput = ResendOtpInputDTO;
export type ResendOtpOutput = ResendOtpOutputDTO;
