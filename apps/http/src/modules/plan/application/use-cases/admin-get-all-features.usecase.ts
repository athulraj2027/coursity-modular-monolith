import { IFeatureQueryRepository } from "../../domain/repositories/plan.repository";
import { Feature } from "../../domain/entities/plan.entity";

export class AdminGetAllFeaturesUseCase {
  constructor(private readonly featureRepo: IFeatureQueryRepository) {}

  async execute(): Promise<Feature[]> {
    return this.featureRepo.findAllFeatures();
  }
}
