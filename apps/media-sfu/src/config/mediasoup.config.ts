import os from "os";
import type {
  RouterRtpCodecCapability,
  WorkerLogTag,
  WorkerLogLevel,
  TransportListenIp,
} from "mediasoup/node/lib/types";
import { env } from "./env";

export interface MediasoupConfig {
  numWorkers: number;
  workerSettings: {
    logLevel: WorkerLogLevel;
    logTags: WorkerLogTag[];
    rtcMinPort: number;
    rtcMaxPort: number;
  };
  routerMediaCodecs: RouterRtpCodecCapability[];
  webRtcTransport: {
    listenIps: TransportListenIp[];
    initialAvailableOutgoingBitrate: number;
    maxSctpMessageSize: number;
    enableUdp: boolean;
    enableTcp: boolean;
    preferUdp: boolean;
  };
}

export const mediasoupConfig: MediasoupConfig = {
  numWorkers: env.MEDIASOUP_NUM_WORKERS > 0 ? env.MEDIASOUP_NUM_WORKERS : Math.max(1, os.cpus().length),
  workerSettings: {
    logLevel: env.MEDIASOUP_LOG_LEVEL as WorkerLogLevel,
    logTags: ["info", "ice", "dtls", "rtp", "srtp", "rtcp"],
    rtcMinPort: env.RTC_MIN_PORT,
    rtcMaxPort: env.RTC_MAX_PORT,
  },
  routerMediaCodecs: [
    {
      kind: "audio",
      mimeType: "audio/opus",
      clockRate: 48000,
      channels: 2,
    },
    {
      kind: "video",
      mimeType: "video/VP8",
      clockRate: 90000,
      parameters: {
        "x-google-start-bitrate": 1000,
      },
    },
    {
      kind: "video",
      mimeType: "video/h264",
      clockRate: 90000,
      parameters: {
        "packetization-mode": 1,
        "profile-level-id": "4d0032",
        "level-asymmetry-allowed": 1,
        "x-google-start-bitrate": 1000,
      },
    },
    {
      kind: "video",
      mimeType: "video/h264",
      clockRate: 90000,
      parameters: {
        "packetization-mode": 1,
        "profile-level-id": "42e01f",
        "level-asymmetry-allowed": 1,
        "x-google-start-bitrate": 1000,
      },
    },
    {
      kind: "video",
      mimeType: "video/VP9",
      clockRate: 90000,
      parameters: {
        "profile-id": 2,
        "x-google-start-bitrate": 1000,
      },
    },
  ],
  webRtcTransport: {
    listenIps: [
      {
        ip: env.MEDIASOUP_LISTEN_IP,
        announcedIp: env.MEDIASOUP_ANNOUNCED_IP || undefined,
      },
    ],
    initialAvailableOutgoingBitrate: 1000000, // 1 Mbps initial
    maxSctpMessageSize: 262144, // 256 KB
    enableUdp: true,
    enableTcp: true,
    preferUdp: true,
  },
};
