import { EmailQueue } from "../../infrastructure/queue/email.queue";
import { EnqueueEmailInputDTO, EnqueueEmailOutputDTO } from "../dtos/send-email.dto";
import { EmailJobData } from "../../domain/entities/email.entity";
import { EmailQueueError } from "../../domain/errors/email.error";

export class QueueEmailUseCase {
    constructor(private readonly emailQueue: EmailQueue) { }

    async execute(input: EnqueueEmailInputDTO): Promise<EnqueueEmailOutputDTO> {
        try {
            const jobData: EmailJobData = {
                templateType: input.templateType,
                payload: input.payload,
                metadata: input.metadata,
                createdAt: Date.now(),
            };

            const jobId = await this.emailQueue.add(jobData, input.priority, input.delay);

            return {
                jobId,
                enqueued: true,
                timestamp: new Date().toISOString(),
            };
        } catch (error: any) {
            console.error("❌ Failed to enqueue email job:", error?.message || error);
            throw new EmailQueueError(`Failed to enqueue email: ${error?.message || "Unknown error"}`);
        }
    }
}
