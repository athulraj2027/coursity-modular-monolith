import { NodeWithDetails } from "@/domain/entities/NodeStats";

export interface PlacementOptions {
  preferredRegion?: string;
  maxCpuThresholdPercent?: number;
}

export interface IPlacementStrategy {
  selectNode(candidates: NodeWithDetails[], options?: PlacementOptions): NodeWithDetails;
}
