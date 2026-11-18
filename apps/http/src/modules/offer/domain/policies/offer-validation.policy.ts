import { CreateOfferDto, UpdateOfferDto } from "../dtos/offer.dto";
import { DiscountType } from "../entities/offer.entity";
import { OfferValidationError } from "../errors/offer.errors";

export class OfferValidationPolicy {
  public static readonly MIN_TITLE_LENGTH = 3;
  public static readonly MAX_TITLE_LENGTH = 120;
  public static readonly MAX_DESCRIPTION_LENGTH = 500;

  /**
   * Validates offer creation parameters
   */
  static validateCreation(dto: CreateOfferDto): void {
    if (!dto.title || !dto.title.trim()) {
      throw new OfferValidationError("Offer title is required.");
    }

    const trimmedTitle = dto.title.trim();
    if (trimmedTitle.length < this.MIN_TITLE_LENGTH) {
      throw new OfferValidationError(
        `Offer title must be at least ${this.MIN_TITLE_LENGTH} characters.`
      );
    }

    if (trimmedTitle.length > this.MAX_TITLE_LENGTH) {
      throw new OfferValidationError(
        `Offer title cannot exceed ${this.MAX_TITLE_LENGTH} characters.`
      );
    }

    if (dto.description && dto.description.length > this.MAX_DESCRIPTION_LENGTH) {
      throw new OfferValidationError(
        `Description cannot exceed ${this.MAX_DESCRIPTION_LENGTH} characters.`
      );
    }

    if (dto.discountValue === undefined || dto.discountValue === null || Number(dto.discountValue) <= 0) {
      throw new OfferValidationError("Discount value must be greater than 0.");
    }

    if (dto.discountType === "PERCENTAGE" && Number(dto.discountValue) > 100) {
      throw new OfferValidationError("Percentage discount cannot exceed 100%.");
    }

    if (dto.maxDiscountAmount !== undefined && dto.maxDiscountAmount !== null && Number(dto.maxDiscountAmount) < 0) {
      throw new OfferValidationError("Maximum discount amount cannot be negative.");
    }

    if (dto.minOrderAmount !== undefined && dto.minOrderAmount !== null && Number(dto.minOrderAmount) < 0) {
      throw new OfferValidationError("Minimum order amount cannot be negative.");
    }

    if (dto.maxRedemptions !== undefined && dto.maxRedemptions !== null && Number(dto.maxRedemptions) <= 0) {
      throw new OfferValidationError("Maximum redemptions must be greater than 0.");
    }

    if (dto.maxRedemptionsPerUser !== undefined && Number(dto.maxRedemptionsPerUser) <= 0) {
      throw new OfferValidationError("Maximum redemptions per user must be at least 1.");
    }

    if (dto.validFrom && dto.validUntil) {
      const from = new Date(dto.validFrom);
      const until = new Date(dto.validUntil);
      if (until.getTime() <= from.getTime()) {
        throw new OfferValidationError("Expiry date must be after the start date.");
      }
    }
  }

  /**
   * Validates offer update parameters
   */
  static validateUpdate(
    dto: UpdateOfferDto,
    existingType: DiscountType,
    existingValue: number,
    existingValidFrom?: Date,
    existingValidUntil?: Date | null
  ): void {
    if (dto.title !== undefined) {
      if (!dto.title || !dto.title.trim()) {
        throw new OfferValidationError("Offer title cannot be empty.");
      }
      const trimmedTitle = dto.title.trim();
      if (trimmedTitle.length < this.MIN_TITLE_LENGTH) {
        throw new OfferValidationError(
          `Offer title must be at least ${this.MIN_TITLE_LENGTH} characters.`
        );
      }
      if (trimmedTitle.length > this.MAX_TITLE_LENGTH) {
        throw new OfferValidationError(
          `Offer title cannot exceed ${this.MAX_TITLE_LENGTH} characters.`
        );
      }
    }

    if (dto.description !== undefined && dto.description !== null && dto.description.length > this.MAX_DESCRIPTION_LENGTH) {
      throw new OfferValidationError(
        `Description cannot exceed ${this.MAX_DESCRIPTION_LENGTH} characters.`
      );
    }

    if (dto.discountValue !== undefined && Number(dto.discountValue) <= 0) {
      throw new OfferValidationError("Discount value must be greater than 0.");
    }

    const effectiveType = dto.discountType || existingType;
    const effectiveValue =
      dto.discountValue !== undefined ? Number(dto.discountValue) : existingValue;

    if (effectiveType === "PERCENTAGE" && effectiveValue > 100) {
      throw new OfferValidationError("Percentage discount cannot exceed 100%.");
    }

    const fromDate = dto.validFrom
      ? new Date(dto.validFrom)
      : existingValidFrom;
    const untilDate =
      dto.validUntil !== undefined
        ? dto.validUntil
          ? new Date(dto.validUntil)
          : null
        : existingValidUntil;

    if (fromDate && untilDate && untilDate.getTime() <= fromDate.getTime()) {
      throw new OfferValidationError("Expiry date must be after the start date.");
    }
  }
}
