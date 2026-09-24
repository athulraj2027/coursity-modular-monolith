import { Router } from "express";
import defaultPrisma from "@/infrastructure/database/prisma.client";
import { PrismaBankDetailRepository } from "./infrastructure/repositories/prisma-bank-detail.repository";
import { CreateBankDetailUseCase } from "./application/use-cases/create-bank-detail.usecase";
import { GetUserBankDetailsUseCase } from "./application/use-cases/get-user-bank-details.usecase";
import { SetPrimaryBankDetailUseCase } from "./application/use-cases/set-primary-bank-detail.usecase";
import { DeleteBankDetailUseCase } from "./application/use-cases/delete-bank-detail.usecase";
import { AdminGetAllBankDetailsUseCase } from "./application/use-cases/admin-get-all-bank-details.usecase";
import { AdminGetBankDetailByIdUseCase } from "./application/use-cases/admin-get-bank-detail-by-id.usecase";
import { AdminUpdateBankVerificationUseCase } from "./application/use-cases/admin-update-bank-verification.usecase";
import { BankDetailController } from "./presentation/controllers/bank-detail.controller";
import { createBankDetailRouter } from "./presentation/routes/bank-detail.routes";

export function createBankDetailModule(prisma = defaultPrisma) {
  const bankDetailRepo = new PrismaBankDetailRepository(prisma);

  const createBankDetailUseCase = new CreateBankDetailUseCase(bankDetailRepo);
  const getUserBankDetailsUseCase = new GetUserBankDetailsUseCase(bankDetailRepo);
  const setPrimaryBankDetailUseCase = new SetPrimaryBankDetailUseCase(bankDetailRepo);
  const deleteBankDetailUseCase = new DeleteBankDetailUseCase(bankDetailRepo);
  const adminGetAllBankDetailsUseCase = new AdminGetAllBankDetailsUseCase(bankDetailRepo);
  const adminGetBankDetailByIdUseCase = new AdminGetBankDetailByIdUseCase(bankDetailRepo);
  const adminUpdateBankVerificationUseCase = new AdminUpdateBankVerificationUseCase(bankDetailRepo);

  const bankDetailController = new BankDetailController(
    createBankDetailUseCase,
    getUserBankDetailsUseCase,
    setPrimaryBankDetailUseCase,
    deleteBankDetailUseCase,
    adminGetAllBankDetailsUseCase,
    adminGetBankDetailByIdUseCase,
    adminUpdateBankVerificationUseCase
  );

  const bankDetailRouter = createBankDetailRouter(bankDetailController);

  return {
    bankDetailRouter,
    bankDetailRepo,
    bankDetailController,
  };
}

const defaultModule = createBankDetailModule();
export const bankDetailRouter: Router = defaultModule.bankDetailRouter;
export default bankDetailRouter;
