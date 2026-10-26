import { Request, Response, NextFunction } from "express";
import { GetCertificateUseCase } from "../../application/use-cases/get-certificate.usecase";
import { ApiResponse } from "@/shared";

export class GetCertificateController {
  constructor(private readonly getCertificateUseCase: GetCertificateUseCase) {}

  execute = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const code = Array.isArray(req.params.code) ? req.params.code[0] : req.params.code;
      const result = await this.getCertificateUseCase.execute(code);
      return ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  };
}
