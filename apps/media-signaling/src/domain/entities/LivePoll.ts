export interface PollOptionEntity {
  id: string;
  text: string;
  voteCount: number;
  percentage: number;
}

export interface LivePollProps {
  id?: string;
  roomId: string;
  creatorId: string;
  creatorName: string;
  question: string;
  options: Array<{ id?: string; text: string; voteCount?: number; percentage?: number }>;
  status?: "ACTIVE" | "ENDED";
  totalVotes?: number;
  durationSeconds?: number;
  createdAt?: string;
  expiresAt?: string;
}

export class LivePollEntity {
  public readonly id: string;
  public readonly roomId: string;
  public readonly creatorId: string;
  public readonly creatorName: string;
  public readonly question: string;
  public options: PollOptionEntity[];
  public status: "ACTIVE" | "ENDED";
  public totalVotes: number;
  public readonly durationSeconds?: number;
  public readonly createdAt: string;
  public readonly expiresAt?: string;

  constructor(props: LivePollProps) {
    this.id = props.id || `poll-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    this.roomId = props.roomId;
    this.creatorId = props.creatorId;
    this.creatorName = props.creatorName;
    this.question = props.question.trim();
    this.status = props.status || "ACTIVE";
    this.durationSeconds = props.durationSeconds;
    this.createdAt = props.createdAt || new Date().toISOString();

    if (props.expiresAt) {
      this.expiresAt = props.expiresAt;
    } else if (props.durationSeconds && props.durationSeconds > 0) {
      this.expiresAt = new Date(Date.now() + props.durationSeconds * 1000).toISOString();
    }

    this.options = props.options.map((opt, index) => ({
      id: opt.id || `opt-${index + 1}`,
      text: opt.text.trim(),
      voteCount: opt.voteCount || 0,
      percentage: opt.percentage || 0,
    }));

    this.totalVotes = props.totalVotes || this.options.reduce((sum, o) => sum + o.voteCount, 0);
    this.recalculatePercentages();
  }

  public recalculatePercentages(): void {
    const total = this.options.reduce((sum, opt) => sum + opt.voteCount, 0);
    this.totalVotes = total;
    for (const opt of this.options) {
      opt.percentage = total > 0 ? Math.round((opt.voteCount / total) * 100) : 0;
    }
  }

  public isExpired(): boolean {
    if (!this.expiresAt) return false;
    return new Date().getTime() >= new Date(this.expiresAt).getTime();
  }

  public toJSON(userVotedOptionId?: string) {
    return {
      id: this.id,
      roomId: this.roomId,
      creatorId: this.creatorId,
      creatorName: this.creatorName,
      question: this.question,
      options: this.options,
      status: this.status,
      totalVotes: this.totalVotes,
      durationSeconds: this.durationSeconds,
      createdAt: this.createdAt,
      expiresAt: this.expiresAt,
      ...(userVotedOptionId ? { userVotedOptionId } : {}),
    };
  }
}
