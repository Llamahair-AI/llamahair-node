import {LlamaWebhookOptions, LlamaWebhookValidationRequest} from "./types";
import * as crypto from "node:crypto";

export class LlamahairWebhookValidator {
    constructor(private readonly options: LlamaWebhookOptions) {}

    public shouldValidate(req: any): boolean {
        const { type } = req.body;
        return type === "validate";
    }

    public validate(req: LlamaWebhookValidationRequest) {
        const data = `${req.timestamp}${req.value}`;
        return crypto.createHmac('sha256', this.options.secret).update(data).digest('hex');
    }
}