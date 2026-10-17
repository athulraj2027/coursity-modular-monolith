declare global {
    namespace Express {
        interface Request {
            user?: {
                userId: string;
                email: string;
                role: string;
            };
        }
    }
}

export type AuthUserPayload = {
    userId: string;
    email: string;
    role: string;
};
