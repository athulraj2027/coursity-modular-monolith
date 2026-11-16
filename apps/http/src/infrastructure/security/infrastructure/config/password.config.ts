export interface PasswordConfig {
    saltRounds: number;
}

export const defaultPasswordConfig: PasswordConfig = {
    saltRounds: Number(process.env.BCRYPT_SALT_ROUNDS) || 10,
};

export const getPasswordConfig = (override?: Partial<PasswordConfig>): PasswordConfig => ({
    ...defaultPasswordConfig,
    ...override,
});

