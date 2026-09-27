import { NodeWithDetails } from "@/domain/entities/NodeStats";
import { IPlacementStrategy, PlacementOptions } from "./IPlacementStrategy";
import { LeastLoadedStrategy } from "./LeastLoadedStrategy";

export class GeoAwareStrategy implements IPlacementStrategy {
  private readonly fallbackStrategy = new LeastLoadedStrategy();

  public selectNode(candidates: NodeWithDetails[], options?: PlacementOptions): NodeWithDetails {
    if (!candidates || candidates.length === 0) {
      return this.fallbackStrategy.selectNode(candidates, options);
    }

    const preferredRegion = options?.preferredRegion;
    if (!preferredRegion) {
      return this.fallbackStrategy.selectNode(candidates, options);
    }

    // Filter by region if tagged on nodeId or info
    const regionalNodes = candidates.filter((c) =>
      c.stats.nodeId.toLowerCase().includes(preferredRegion.toLowerCase())
    );

    if (regionalNodes.length > 0) {
      return this.fallbackStrategy.selectNode(regionalNodes, options);
    }

    // Fall back to all healthy nodes
    return this.fallbackStrategy.selectNode(candidates, options);
  }
}
