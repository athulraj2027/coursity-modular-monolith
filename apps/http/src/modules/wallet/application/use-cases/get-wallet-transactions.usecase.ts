import { IWalletRepository } from "../../domain/repositories/wallet.repository.interface";
import { WalletTransactionEntity } from "../../domain/entities/wallet-transaction.entity";
import { ListTransactionsQueryDto } from "../../domain/dtos/wallet-transaction.dto";

export class GetWalletTransactionsUseCase {
  constructor(private readonly walletRepo: IWalletRepository) {}

  async execute(
    query: ListTransactionsQueryDto
  ): Promise<{ items: WalletTransactionEntity[]; total: number }> {
    return this.walletRepo.getTransactions(query);
  }
}
