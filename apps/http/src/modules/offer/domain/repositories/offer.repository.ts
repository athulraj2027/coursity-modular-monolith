import { OfferEntity, OfferRedemptionEntity } from "../entities/offer.entity";
import {
  CreateOfferDto,
  UpdateOfferDto,
  ListOffersQueryDto,
  RecordRedemptionDto,
  OfferAnalyticsDto,
} from "../dtos/offer.dto";

export interface PlanLookupDto {
  id: string;
  price: number | string;
  billingCycle?: string | null;
  name?: string;
  slug?: string;
}

export interface IPlanLookupRepository {
  findById(planId: string): Promise<PlanLookupDto | null>;
}

/**
 * Segregated query repository for reading active offers, customer limits, and history
 */
export interface IOfferQueryRepository {
  findById(id: string): Promise<OfferEntity | null>;
  findActiveOffers(planId?: string, billingCycle?: string): Promise<OfferEntity[]>;
  findRedemptionCountByUser(offerId: string, teacherProfileId: string): Promise<number>;
  hasUserSubscribedBefore(teacherProfileId: string): Promise<boolean>;
}

/**
 * Segregated repository for admin CRUD and status toggling
 */
export interface IAdminOfferRepository {
  create(data: CreateOfferDto): Promise<OfferEntity>;
  update(id: string, data: UpdateOfferDto): Promise<OfferEntity>;
  delete(id: string): Promise<void>;
  toggleStatus(id: string): Promise<OfferEntity>;
  findAllAdmin(query: ListOffersQueryDto): Promise<{ offers: OfferEntity[]; total: number }>;
}

/**
 * Segregated repository for redemption audit logs and financial analytics
 */
export interface IOfferRedemptionRepository {
  recordRedemption(data: RecordRedemptionDto): Promise<OfferRedemptionEntity>;
  incrementRedemptions(offerId: string): Promise<void>;
  getAnalytics(): Promise<OfferAnalyticsDto>;
}

/**
 * Unified Offer Repository Interface (ISP Aggregator)
 */
export interface IOfferRepository
  extends IOfferQueryRepository,
    IAdminOfferRepository,
    IOfferRedemptionRepository {}
