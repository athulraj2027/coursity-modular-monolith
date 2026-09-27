import { ISessionRegistry } from "@/domain/ports/ISessionRegistry";
import { RouterManager } from "@/infrastructure/mediasoup/RouterManager";
import { ClassSession } from "@/domain/entities/ClassSession";

export class GetOrCreateSessionUseCase {
  constructor(
    private readonly sessionRegistry: ISessionRegistry,
    private readonly routerManager: RouterManager
  ) {}

  public async execute(roomId: string): Promise<ClassSession> {
    let session = this.sessionRegistry.get(roomId);
    if (session) {
      return session;
    }

    const { router, workerIndex } = await this.routerManager.getOrCreateRouter(roomId);
    session = new ClassSession(roomId, router, workerIndex);
    this.sessionRegistry.set(session);

    return session;
  }
}
