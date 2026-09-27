import type { Router, WebRtcTransport } from "mediasoup/node/lib/types";
import { mediasoupConfig } from "@/config/mediasoup.config";
import { logger } from "@/shared/logger/Logger";

export class TransportFactory {
  public static async createWebRtcTransport(
    router: Router,
    options?: {
      direction?: "send" | "recv";
      enableSctp?: boolean;
    }
  ): Promise<WebRtcTransport> {
    const { listenIps, initialAvailableOutgoingBitrate, maxSctpMessageSize, enableUdp, enableTcp, preferUdp } =
      mediasoupConfig.webRtcTransport;

    const transport = await router.createWebRtcTransport({
      listenIps,
      enableUdp,
      enableTcp,
      preferUdp,
      initialAvailableOutgoingBitrate,
      enableSctp: Boolean(options?.enableSctp),
      maxSendMessageSize: options?.enableSctp ? maxSctpMessageSize : undefined,
      appData: {
        direction: options?.direction || "send",
      },
    });

    // Set max incoming bitrate limit (e.g. 5 Mbps) to prevent bandwidth saturation per client
    await transport.setMaxIncomingBitrate(5000000);

    logger.debug(
      `Created WebRtcTransport [id:${transport.id}] on router (direction:${options?.direction || "send"})`
    );

    return transport;
  }
}
