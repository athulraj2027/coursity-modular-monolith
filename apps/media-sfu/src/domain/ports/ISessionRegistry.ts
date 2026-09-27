import { ClassSession } from "../entities/ClassSession";

export interface ISessionRegistry {
  get(roomId: string): ClassSession | undefined;
  set(session: ClassSession): void;
  delete(roomId: string): boolean;
  getAll(): ClassSession[];
  count(): number;
  getTotalConsumersCount(): number;
  getTotalProducersCount(): number;
  getTotalTransportsCount(): number;
}
