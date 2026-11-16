import bcrypt from "bcryptjs";
import { IPasswordService, PasswordService } from "../../domain/contracts/password-service.interface";
import { getPasswordConfig, PasswordConfig } from "../config/password.config";

export class BcryptPasswordService extends PasswordService implements IPasswordService {
    private readonly saltRounds: number;

    constructor(config?: Partial<PasswordConfig>) {
        super();
        const resolvedConfig = getPasswordConfig(config);
        this.saltRounds = resolvedConfig.saltRounds;
    }

    async hash(password: string): Promise<string> {
        return bcrypt.hash(password, this.saltRounds);
    }

    async compare(plain: string, hashed: string): Promise<boolean> {
        return bcrypt.compare(plain, hashed);
    }
}

