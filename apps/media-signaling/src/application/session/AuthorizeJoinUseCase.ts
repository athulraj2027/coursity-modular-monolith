import { ITokenService } from "@/domain/ports/ITokenService";
import { ICoreApiClient } from "@/domain/ports/ICoreApiClient";
import { AllocateRoomUseCase } from "./AllocateRoomUseCase";
import {
  JoinSessionResponseData,
  Role,
} from "@/shared/types/ws-signaling.types";
import { DEFAULT_PERMISSIONS } from "@/config/constants";
import { env } from "@/config/env";
import { UnauthorizedError } from "@/shared/errors/AppErrors";

export interface AuthorizeJoinInput {
  classSessionId: string;
  userId?: string;
  userToken?: string;
  role?: Role;
  displayName?: string;
}

export class AuthorizeJoinUseCase {
  constructor(
    private readonly allocateRoomUseCase: AllocateRoomUseCase,
    private readonly tokenService: ITokenService,
    private readonly coreApiClient: ICoreApiClient
  ) {}

  public async execute(input: AuthorizeJoinInput): Promise<JoinSessionResponseData> {
    const { classSessionId, userToken } = input;
    let userId = input.userId;
    let role: Role = input.role || "STUDENT";
    let displayName = input.displayName;

    // 1. Authenticate user if token provided
    if (userToken) {
      try {
        const decoded = this.tokenService.verifyToken<{
          userId?: string;
          id?: string;
          sub?: string;
          role?: Role;
          name?: string;
          email?: string;
        }>(userToken);

        userId = decoded.userId || decoded.id || decoded.sub || userId;
        if (decoded.role) {
          role = decoded.role as Role;
        }
        if (decoded.name && !displayName) {
          displayName = decoded.name;
        }
      } catch {
        throw new UnauthorizedError("Invalid or expired user authentication token");
      }

      // Check core API verification
      try {
        const access = await this.coreApiClient.verifySessionAccess(classSessionId, userToken);
        if (!access.allowed) {
          throw new UnauthorizedError("User is not authorized to join this class session");
        }
        role = access.role || role;
        if (access.displayName) displayName = access.displayName;
      } catch (err) {
        // If core API verification fails with unauthorized, rethrow
        if (err instanceof UnauthorizedError) throw err;
      }
    }

    if (!userId) {
      userId = `guest-${Math.random().toString(36).substring(2, 9)}`;
      role = "GUEST";
    }

    // 2. Allocate or lookup active SFU node for this session
    const allocation = await this.allocateRoomUseCase.execute({ classSessionId });

    // 3. Derive permissions by role
    const permissions = DEFAULT_PERMISSIONS[role] || DEFAULT_PERMISSIONS.STUDENT;

    // 4. Generate short-lived media SFU Join Ticket token
    const joinToken = this.tokenService.createJoinToken(
      {
        userId,
        classSessionId,
        role,
        displayName,
        canProduceAudio: permissions.canProduceAudio,
        canProduceVideo: permissions.canProduceVideo,
        canProduceScreen: permissions.canProduceScreen,
        canConsume: permissions.canConsume,
        assignedNodeId: allocation.nodeId,
      },
      env.JOIN_TOKEN_EXPIRES_IN_SECONDS
    );

    return {
      classSessionId,
      nodeId: allocation.nodeId,
      wsUrl: allocation.wsUrl,
      httpUrl: allocation.httpUrl,
      joinToken,
      role,
      expiresIn: env.JOIN_TOKEN_EXPIRES_IN_SECONDS,
    };
  }
}
