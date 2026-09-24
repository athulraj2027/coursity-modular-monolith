import { PayoutRequestEntity } from "../entities/payout-request.entity";
import {
  ListPayoutsQueryDto,
  AdminProcessPayoutDto,
} from "../dtos/payout-request.dto";

export interface IPayoutRequestRepository {
  /**
   * Create a new withdrawal payout request and atomically lock the wallet funds
   */
  createRequest(params: {
    userId: string;
    amount: number;
    bankDetailId: string;
  }): Promise<PayoutRequestEntity>;

  /**
   * Find a payout request by ID
   */
  findById(id: string): Promise<PayoutRequestEntity | null>;

  /**
   * Get user's past payout requests
   */
  findByUserId(
    query: ListPayoutsQueryDto
  ): Promise<{ items: PayoutRequestEntity[]; total: number }>;

  /**
   * Admin list all payout requests with search & filters
   */
  adminListPayouts(
    query: ListPayoutsQueryDto
  ): Promise<{
    items: PayoutRequestEntity[];
    total: number;
    stats: {
      pendingAmount: number;
      pendingCount: number;
      completedAmount: number;
      completedCount: number;
    };
  }>;

  /**
   * Admin process payout (Approve/Complete or Reject & unlock funds)
   */
  processPayout(dto: AdminProcessPayoutDto): Promise<PayoutRequestEntity>;
}
