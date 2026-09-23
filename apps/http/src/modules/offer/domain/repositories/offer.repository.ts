import { OfferEntity, OfferRedemptionEntity } from "../entities/offer.entity";
import {
  CreateOfferDto,
  UpdateOfferDto,
  ListOffersQueryDto,
  RecordRedemptionDto,
  OfferAnalyticsDto,
} from "../dtos/offer.dto";

export interface IOfferRepository {
  findById(id: string): Promise<OfferEntity | null>;
  findActiveOffers(planId?: string, billingCycle?: string): Promise<OfferEntity[]>;
  findRedemptionCountByUser(offerId: string, teacherProfileId: string): Promise<number>;
  hasUserSubscribedBefore(teacherProfileId: string): Promise<boolean>;
  create(data: CreateOfferDto): Promise<OfferEntity>;
  update(id: string, data: UpdateOfferDto): Promise<OfferEntity>;
  delete(id: string): Promise<void>;
  toggleStatus(id: string): Promise<OfferEntity>;
  findAllAdmin(query: ListOffersQueryDto): Promise<{ offers: OfferEntity[]; total: number }>;
  recordRedemption(data: RecordRedemptionDto): Promise<OfferRedemptionEntity>;
  incrementRedemptions(offerId: string): Promise<void>;
  getAnalytics(): Promise<OfferAnalyticsDto>;
}
