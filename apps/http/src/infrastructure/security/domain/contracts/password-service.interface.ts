export interface IPasswordHasher {
    hash(password: string): Promise<string>;
}

export interface IPasswordComparer {
    compare(plain: string, hashed: string): Promise<boolean>;
}

export interface IPasswordService extends IPasswordHasher, IPasswordComparer {
    hash(password: string): Promise<string>;
    compare(plain: string, hashed: string): Promise<boolean>;
}

export abstract class PasswordService implements IPasswordService {
    abstract hash(password: string): Promise<string>;
    abstract compare(plain: string, hashed: string): Promise<boolean>;
}

