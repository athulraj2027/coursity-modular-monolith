export interface InterviewSummaryData {
  candidateStrengths: string[];
  candidateWeaknesses: string[];
  topicsCovered: string[];
  importantClaims: string[];
  unresolvedAreas: string[];
  observedAnomalies: string[];
}

export class InterviewSummary {
  private data: InterviewSummaryData = {
    candidateStrengths: [],
    candidateWeaknesses: [],
    topicsCovered: [],
    importantClaims: [],
    unresolvedAreas: [],
    observedAnomalies: [],
  };

  addStrength(strength: string): void {
    if (strength && !this.data.candidateStrengths.includes(strength)) {
      this.data.candidateStrengths.push(strength);
    }
  }

  addWeakness(weakness: string): void {
    if (weakness && !this.data.candidateWeaknesses.includes(weakness)) {
      this.data.candidateWeaknesses.push(weakness);
    }
  }

  addTopic(topic: string): void {
    if (topic && !this.data.topicsCovered.includes(topic)) {
      this.data.topicsCovered.push(topic);
    }
  }

  addClaim(claim: string): void {
    if (claim && !this.data.importantClaims.includes(claim)) {
      this.data.importantClaims.push(claim);
    }
  }

  addUnresolvedArea(area: string): void {
    if (area && !this.data.unresolvedAreas.includes(area)) {
      this.data.unresolvedAreas.push(area);
    }
  }

  resolveArea(area: string): void {
    this.data.unresolvedAreas = this.data.unresolvedAreas.filter(
      (a) => a !== area
    );
  }

  addAnomaly(anomaly: string): void {
    if (anomaly && !this.data.observedAnomalies.includes(anomaly)) {
      this.data.observedAnomalies.push(anomaly);
    }
  }

  getData(): Readonly<InterviewSummaryData> {
    return { ...this.data };
  }
}
