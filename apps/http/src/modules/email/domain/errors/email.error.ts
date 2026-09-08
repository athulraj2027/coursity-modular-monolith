import { AppError } from "@/app/errors";

export class EmailSendError extends AppError {
    constructor(message: string = "Failed to send email", details?: any) {
        super(message, 500, false);
        this.name = "EmailSendError";
    }
}

export class EmailQueueError extends AppError {
    constructor(message: string = "Failed to enqueue email job") {
        super(message, 500, false);
        this.name = "EmailQueueError";
    }
}
