import { NotFoundError, BadRequestError } from "@/app/errors";

export class ProfileError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "ProfileError";
    }
}

export class ProfileNotFoundError extends NotFoundError {
    constructor(message = "User profile not found") {
        super(message);
        this.name = "ProfileNotFoundError";
    }
}

export class ProfileValidationError extends BadRequestError {
    constructor(message = "Invalid profile data provided.") {
        super(message);
        this.name = "ProfileValidationError";
    }
}

export class ProfileSocialLinksLockedError extends BadRequestError {
    constructor(message = "Verified social links cannot be modified once your instructor account is approved.") {
        super(message);
        this.name = "ProfileSocialLinksLockedError";
    }
}

export class TeacherVerificationNotEligibleError extends BadRequestError {
    constructor(message = "Account is not eligible for teacher verification.") {
        super(message);
        this.name = "TeacherVerificationNotEligibleError";
    }
}

export class MaxVerificationAttemptsError extends BadRequestError {
    constructor(message = "You have reached the maximum verification submission limit.") {
        super(message);
        this.name = "MaxVerificationAttemptsError";
    }
}

export class PasswordChangeNotAllowedError extends BadRequestError {
    constructor(message = "Password change is not allowed for this account.") {
        super(message);
        this.name = "PasswordChangeNotAllowedError";
    }
}
