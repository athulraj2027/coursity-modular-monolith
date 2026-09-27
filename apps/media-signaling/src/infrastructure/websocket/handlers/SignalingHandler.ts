import { AuthorizeJoinUseCase } from "@/application/session/AuthorizeJoinUseCase";
import { AllocateRoomUseCase } from "@/application/session/AllocateRoomUseCase";
import { GetRoomAllocationUseCase } from "@/application/nodes/GetRoomAllocationUseCase";
import {
  JoinSessionRequestData,
  JoinSessionResponseData,
  AllocateRoomRequestData,
  AllocateRoomResponseData,
  RoomQueryRequestData,
  RoomQueryResponseData,
} from "@/shared/types/ws-signaling.types";
import { ValidationError } from "@/shared/errors/AppErrors";

export class SignalingHandler {
  constructor(
    private readonly authorizeJoinUseCase: AuthorizeJoinUseCase,
    private readonly allocateRoomUseCase: AllocateRoomUseCase,
    private readonly getRoomAllocationUseCase: GetRoomAllocationUseCase
  ) {}

  public async handleJoin(
    data: JoinSessionRequestData,
    authContext?: { userId?: string; role?: string }
  ): Promise<JoinSessionResponseData> {
    if (!data.classSessionId) {
      throw new ValidationError("classSessionId is required for session:join");
    }

    return await this.authorizeJoinUseCase.execute({
      classSessionId: data.classSessionId,
      userToken: data.token,
      userId: authContext?.userId,
      role: data.role as any,
      displayName: data.displayName,
    });
  }

  public async handleAllocate(
    data: AllocateRoomRequestData
  ): Promise<AllocateRoomResponseData> {
    if (!data.classSessionId) {
      throw new ValidationError("classSessionId is required for session:allocate");
    }

    return await this.allocateRoomUseCase.execute({
      classSessionId: data.classSessionId,
      region: data.region,
    });
  }

  public async handleRoomQuery(
    data: RoomQueryRequestData
  ): Promise<RoomQueryResponseData> {
    if (!data.classSessionId) {
      throw new ValidationError("classSessionId is required for room:query");
    }

    return await this.getRoomAllocationUseCase.execute(data.classSessionId);
  }
}
