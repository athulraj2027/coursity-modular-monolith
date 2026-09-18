export interface ChangePasswordDto {
    userId: string;
    currentPassword?: string;
    newPassword: string;
    confirmPassword?: string;
}

export interface ChangePasswordResultDto {
    success: boolean;
    message: string;
}
