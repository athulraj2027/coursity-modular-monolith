import bcrypt from "bcryptjs";
import { PasswordService } from "../../domain/services/password.service";

export class BcryptPasswordService implements PasswordService {
    private readonly saltRounds = 10;

    async hash(password: string): Promise<string> {
        return bcrypt.hash(password, this.saltRounds);
    }

    async compare(plain: string, hashed: string): Promise<boolean> {
        return bcrypt.compare(plain, hashed);
    }
}
