import { UserRepository } from "@/modules/user";
import { PasswordService } from "../../domain/services/password.service";
import { ConflictError } from "@/app/errors";
import { SignupUserInputDTO, SignupUserOutputDTO } from "../dtos/signup.dto";

export class SignupUser {
    constructor(
        private readonly repository: UserRepository,
        private readonly passwordService: PasswordService
    ) { }

    async execute(input: SignupUserInputDTO): Promise<SignupUserOutputDTO> {
        console.log(input);

        const email = input.email.toLowerCase().trim();

        // 1. Check whether user already exists
        const existingUser = await this.repository.findByEmail(email);

        if (existingUser) {
            throw new ConflictError("An account with this email already exists");
        }

        // 2. Hash password
        const hashedPassword = await this.passwordService.hash(input.password);

        // 3. Create user
        const user = await this.repository.create({
            name: input.name.trim(),
            email,
            password: hashedPassword,
            role: input.role || "STUDENT",
            authProvider: "LOCAL",
            isEmailVerified: false,
        });

        return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            authProvider: user.authProvider,
            isEmailVerified: user.isEmailVerified,
        };
    }
}