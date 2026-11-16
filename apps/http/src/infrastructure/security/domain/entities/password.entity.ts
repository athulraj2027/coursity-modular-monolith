export type HashedPassword = string;
export type PlainPassword = string;

export interface PasswordHashOptions {
    saltRounds?: number;
}

