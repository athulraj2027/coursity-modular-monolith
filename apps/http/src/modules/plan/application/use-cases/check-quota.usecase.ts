import { QuotaEnforcementService } from "../../domain/services/quota-enforcement.service";
import { QuotaEvaluationResult } from "../../domain/entities/plan.entity";
import { CheckQuotaDto } from "../../domain/dtos/plan.dto";

export class CheckQuotaUseCase {
  constructor(private readonly quotaEnforcementService: QuotaEnforcementService) {}

  async execute(dto: CheckQuotaDto): Promise<QuotaEvaluationResult> {
    return this.quotaEnforcementService.evaluateQuota(
      dto.teacherProfileId,
      dto.featureCode,
      dto.requiredAmount || 1
    );
  }
}
