import { EnrollmentRepository } from "../../domain/repositories/enrollment.repository";
import { CourseCertificateEntity } from "../../domain/entities/refund.entity";
import { NotFoundError } from "@/app/errors";

export class GetCertificateUseCase {
  constructor(private readonly enrollmentRepo: EnrollmentRepository) {}

  async execute(certificateCode: string): Promise<CourseCertificateEntity> {
    const certificate = await this.enrollmentRepo.findCertificateByCode(certificateCode.trim().toUpperCase());
    if (!certificate) {
      throw new NotFoundError(`Certificate with code '${certificateCode}' was not found.`);
    }
    return certificate;
  }
}
