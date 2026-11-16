import { randomInt } from "node:crypto";
import { IOtpGenerator } from "../../domain/services/otp-generator.service.interface";

export class CryptoOtpGeneratorService implements IOtpGenerator {
    generate(length: number = 6): string {
        const min = Math.pow(10, length - 1);
        const max = Math.pow(10, length);
        return randomInt(min, max).toString();
    }
}

