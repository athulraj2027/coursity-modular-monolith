import { CreateWebRtcTransportUseCase } from "@/application/media/CreateWebRtcTransportUseCase";
import { ConnectTransportUseCase } from "@/application/media/ConnectTransportUseCase";
import type {
  CreateTransportRequestData,
  ConnectTransportRequestData,
  CreateTransportResponseData,
} from "@/shared/types/ws-protocol.types";

export class TransportHandler {
  constructor(
    private readonly createTransportUseCase: CreateWebRtcTransportUseCase,
    private readonly connectTransportUseCase: ConnectTransportUseCase
  ) {}

  public async handleCreateTransport(
    roomId: string,
    userId: string,
    data: CreateTransportRequestData
  ): Promise<CreateTransportResponseData> {
    return await this.createTransportUseCase.execute({
      roomId,
      userId,
      direction: data.direction,
    });
  }

  public async handleConnectTransport(
    roomId: string,
    userId: string,
    data: ConnectTransportRequestData
  ): Promise<{ connected: boolean }> {
    return await this.connectTransportUseCase.execute({
      roomId,
      userId,
      transportId: data.transportId,
      dtlsParameters: data.dtlsParameters,
    });
  }
}
