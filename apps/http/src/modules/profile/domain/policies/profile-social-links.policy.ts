import { TeacherProfile } from "../entities/teacher-profile.entity";
import { ProfileSocialLinksLockedError } from "../errors/profile.errors";

export class ProfileSocialLinksPolicy {
    /**
     * Determines whether instructor social media links (LinkedIn, Twitter/X) are locked from edits.
     */
    static isLocked(
        approvalStatus?: string | null,
        isApproved?: boolean | null
    ): boolean {
        return (
            approvalStatus === "IN_PROGRESS" ||
            approvalStatus === "VERIFIED" ||
            Boolean(isApproved)
        );
    }

    /**
     * Asserts that incoming social link updates do not violate locking rules.
     * Throws `ProfileSocialLinksLockedError` if a locked account attempts to change LinkedIn or Twitter URLs.
     */
    static assertCanModifySocialLinks(params: {
        teacherProfile?: TeacherProfile | null;
        incomingLinkedin?: string | null;
        incomingTwitter?: string | null;
    }): void {
        const { teacherProfile, incomingLinkedin, incomingTwitter } = params;
        if (!teacherProfile) return;

        const currentStatus =
            teacherProfile.approvalStatus ||
            (teacherProfile.isApproved ? "VERIFIED" : "PENDING");

        const locked = this.isLocked(currentStatus, teacherProfile.isApproved);
        if (!locked) return;

        const currentLinkedin = teacherProfile.linkedinUrl
            ? teacherProfile.linkedinUrl.trim()
            : null;
        const currentTwitter = teacherProfile.twitterUrl
            ? teacherProfile.twitterUrl.trim()
            : null;

        if (incomingLinkedin !== undefined) {
            const normalizedIncomingLinkedin = incomingLinkedin
                ? incomingLinkedin.trim()
                : null;
            if (normalizedIncomingLinkedin !== currentLinkedin) {
                const message =
                    currentStatus === "IN_PROGRESS"
                        ? "Social media links (LinkedIn) cannot be modified while your application is under evaluation (In Progress)."
                        : "Verified social links (LinkedIn) cannot be modified once your instructor account is approved by an administrator. You can only update your website URL.";
                throw new ProfileSocialLinksLockedError(message);
            }
        }

        if (incomingTwitter !== undefined) {
            const normalizedIncomingTwitter = incomingTwitter
                ? incomingTwitter.trim()
                : null;
            if (normalizedIncomingTwitter !== currentTwitter) {
                const message =
                    currentStatus === "IN_PROGRESS"
                        ? "Social media links (Twitter/X) cannot be modified while your application is under evaluation (In Progress)."
                        : "Verified social links (Twitter/X) cannot be modified once your instructor account is approved by an administrator. You can only update your website URL.";
                throw new ProfileSocialLinksLockedError(message);
            }
        }
    }

    /**
     * Resolves effective social URLs to store, preventing overwrite if locked.
     */
    static resolveEffectiveUrls(params: {
        teacherProfile?: TeacherProfile | null;
        incomingLinkedin?: string | null;
        incomingTwitter?: string | null;
    }): {
        linkedinUrl: string | null | undefined;
        twitterUrl: string | null | undefined;
    } {
        const { teacherProfile, incomingLinkedin, incomingTwitter } = params;
        if (!teacherProfile) {
            return {
                linkedinUrl: incomingLinkedin,
                twitterUrl: incomingTwitter,
            };
        }

        const currentStatus =
            teacherProfile.approvalStatus ||
            (teacherProfile.isApproved ? "VERIFIED" : "PENDING");
        const locked = this.isLocked(currentStatus, teacherProfile.isApproved);

        return {
            linkedinUrl: locked ? teacherProfile.linkedinUrl : incomingLinkedin,
            twitterUrl: locked ? teacherProfile.twitterUrl : incomingTwitter,
        };
    }
}
