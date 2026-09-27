import { ProduceMediaUseCase } from "@/application/media/ProduceMediaUseCase";
import { ConsumeMediaUseCase } from "@/application/media/ConsumeMediaUseCase";
import { ResumeConsumerUseCase } from "@/application/media/ResumeConsumerUseCase";
import { CloseProducerUseCase } from "@/application/media/CloseProducerUseCase";
import type {
  ProduceMediaRequestData,
  ConsumeMediaRequestData,
  ResumeConsumerRequestData,
  CloseProducerRequestData,
  ProduceMediaResponseData,
  ConsumeMediaResponseData,
} from "@/shared/types/ws-protocol.types";

export class ProducerConsumerHandler {
  constructor(
    private readonly produceMediaUseCase: ProduceMediaUseCase,
    private readonly consumeMediaUseCase: ConsumeMediaUseCase,
    private readonly resumeConsumerUseCase: ResumeConsumerUseCase,
    private readonly closeProducerUseCase: CloseProducerUseCase
  ) {}

  public async handleProduce(
    roomId: string,
    userId: string,
    data: ProduceMediaRequestData
  ): Promise<ProduceMediaResponseData> {
    return await this.produceMediaUseCase.execute({
      roomId,
      userId,
      transportId: data.transportId,
      kind: data.kind,
      rtpParameters: data.rtpParameters,
      appData: data.appData,
    });
  }

  public async handleConsume(
    roomId: string,
    userId: string,
    data: ConsumeMediaRequestData
  ): Promise<ConsumeMediaResponseData> {
    return await this.consumeMediaUseCase.execute({
      roomId,
      userId,
      transportId: data.transportId,
      producerId: data.producerId,
      rtpCapabilities: data.rtpCapabilities,
    });
  }

  public async handleResumeConsumer(
    roomId: string,
    userId: string,
    data: ResumeConsumerRequestData
  ): Promise<{ resumed: boolean }> {
    return await this.resumeConsumerUseCase.execute({
      roomId,
      userId,
      consumerId: data.consumerId,
    });
  }

  public handleCloseProducer(
    roomId: string,
    userId: string,
    data: CloseProducerRequestData
  ): { closed: boolean } {
    return this.closeProducerUseCase.execute({
      roomId,
      userId,
      producerId: data.producerId,
    });
  }
}
