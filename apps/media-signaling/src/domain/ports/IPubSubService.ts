export interface IPubSubService {
  publish<T = unknown>(channel: string, message: T): Promise<void>;
  subscribe<T = unknown>(channel: string, handler: (message: T) => void): Promise<() => void>;
}
