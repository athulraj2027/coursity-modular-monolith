import { ProfileValidationError } from "../errors/profile.errors";

export class ProfileValidationPolicy {
    public static readonly MIN_NAME_LENGTH = 2;
    public static readonly MAX_NAME_LENGTH = 100;
    public static readonly MAX_BIO_LENGTH = 1000;
    public static readonly MIN_EXPERIENCE_YEARS = 0;
    public static readonly MAX_EXPERIENCE_YEARS = 80;

    /**
     * Validates display name formatting.
     */
    static validateName(name?: string | null): void {
        if (name === undefined || name === null) return;
        const trimmed = name.trim();
        if (trimmed.length < this.MIN_NAME_LENGTH) {
            throw new ProfileValidationError(
                `Name must be at least ${this.MIN_NAME_LENGTH} characters.`
            );
        }
        if (trimmed.length > this.MAX_NAME_LENGTH) {
            throw new ProfileValidationError(
                `Name cannot exceed ${this.MAX_NAME_LENGTH} characters.`
            );
        }
    }

    /**
     * Validates user bio formatting.
     */
    static validateBio(bio?: string | null): void {
        if (bio === undefined || bio === null) return;
        if (bio.length > this.MAX_BIO_LENGTH) {
            throw new ProfileValidationError(
                `Bio cannot exceed ${this.MAX_BIO_LENGTH} characters.`
            );
        }
    }

    /**
     * Validates experience years bounds.
     */
    static validateExperienceYears(years?: number | null): void {
        if (years === undefined || years === null) return;
        if (!Number.isInteger(years)) {
            throw new ProfileValidationError("Experience years must be an integer.");
        }
        if (years < this.MIN_EXPERIENCE_YEARS) {
            throw new ProfileValidationError("Experience years cannot be negative.");
        }
        if (years > this.MAX_EXPERIENCE_YEARS) {
            throw new ProfileValidationError(
                `Experience years cannot exceed ${this.MAX_EXPERIENCE_YEARS}.`
            );
        }
    }
}
