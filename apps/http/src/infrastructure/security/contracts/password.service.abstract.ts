export abstract class PasswordService {
    abstract hash(password: string): Promise<string>;
    abstract compare(plain: string, hashed: string): Promise<boolean>;
}
