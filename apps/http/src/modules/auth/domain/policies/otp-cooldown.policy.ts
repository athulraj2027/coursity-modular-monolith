import { BadRequestError } from "@/app/errors";

export class OtpCooldownPolicy {
    public static readonly DEFAULT_COOLDOWN_MS = 60 * 1000; // 1 minute (60 seconds)

    /**
     * Checks if cooldown period has elapsed since the last OTP was dispatched.
     * Throws BadRequestError if cooldown is still in effect.
     */
    static assertCooldownElapsed(
        createdAt?: number,
        cooldownMs: number = this.DEFAULT_COOLDOWN_MS,
        actionPrompt: string = "a new one"
    ): void {
        if (!createdAt) {
            return;
        }

        const timeElapsed = Date.now() - createdAt;
        if (timeElapsed < cooldownMs) {
            const remainingMinutes = Math.ceil((cooldownMs - timeElapsed) / (60 * 1000));
            throw new BadRequestError(
                `An OTP has already been sent. Please wait ${remainingMinutes} minute${remainingMinutes > 1 ? "s" : ""} before requesting ${actionPrompt}.`
            );
        }
    }
}

