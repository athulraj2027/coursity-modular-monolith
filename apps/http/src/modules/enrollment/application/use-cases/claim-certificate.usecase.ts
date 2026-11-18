import { ICourseCertificateRepository, IStudentEnrollmentRepository } from "../../domain/repositories/enrollment.repository";
import { CourseCertificateEntity } from "../../domain/entities/refund.entity";
import { CourseCertificatePolicy } from "../../domain/policies/course-certificate.policy";
import { UserRepository } from "@/modules/user/domain/repositories/user.repository";
import { BadRequestError, NotFoundError } from "@/app/errors";

export class ClaimCertificateUseCase {
  constructor(
    private readonly enrollmentRepo: IStudentEnrollmentRepository & ICourseCertificateRepository,
    private readonly userRepo: UserRepository
  ) {}

  async execute(studentId: string, enrollmentId: string): Promise<CourseCertificateEntity> {
    const enrollment = await this.enrollmentRepo.findEnrollmentById(enrollmentId);
    if (!enrollment) {
      throw new NotFoundError("Enrollment not found.");
    }

    if (enrollment.studentId !== studentId) {
      throw new BadRequestError("You do not own this enrollment.");
    }

    // Check if already claimed
    const existing = await this.enrollmentRepo.findCertificateByEnrollmentId(enrollmentId);
    if (existing) {
      return existing;
    }

    // Check completion requirements using Domain Policy
    const eligibility = CourseCertificatePolicy.isEligibleForCertificate(enrollment);
    if (!eligibility.isEligible) {
      throw new BadRequestError(eligibility.reasonIfNotEligible || "Certificate eligibility requirements not met.");
    }

    const certificateCode = CourseCertificatePolicy.generateCertificateCode();
    const student = await this.userRepo.findById(studentId);

    return this.enrollmentRepo.createCertificate({
      enrollmentId,
      certificateCode,
      studentName: student?.name || enrollment.studentName || "Student",
      courseTitle: enrollment.courseTitle || "Live Course",
      instructorName: enrollment.instructorName || "Instructor",
    });
  }
}
