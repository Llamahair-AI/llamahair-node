import * as crypto from "node:crypto";
import {
    LlamaOutputRequest,
    LlamaOutputResponse,
    LlamaResponse,
    LlamaRetreiveClientOptions,
} from "./types";
import ky from "ky";
import {KyHeadersInit} from "ky/distribution/types/options";

export class LlamaRetrieveClient {
    readonly MAX_POLL_TIME = 45000; // 45sec timeout
    readonly DELAY_MS = 250;

    constructor(private options: LlamaRetreiveClientOptions) {}

    public retreive(request: LlamaOutputRequest): Promise<LlamaResponse> {
        const startTime = new Date().getTime();
        return new Promise<LlamaResponse>(async (resolve) => {
            const response = await this.requestLoop(request, startTime);
            resolve(response)
        })
    }

    private async requestLoop(request: LlamaOutputRequest, startTime: number): Promise<LlamaResponse> {
        const response = await this.makeRequest(request);

        switch (response.status) {
            case "completed":
                return response.response;
            case "failed":
                throw new Error(`Request failed: ${response.status} ${response.prompt_id} ${request.jobId}`);
            default:
                const currentTime = new Date().getTime();
                if (currentTime - startTime < this.MAX_POLL_TIME) {
                    return this.requestLoop(request, startTime);
                } else {
                    throw new Error(`Request timedout: ${request.jobId}`);
                }
        }
    }

    private async makeRequest(request: LlamaOutputRequest): Promise<LlamaOutputResponse> {
        const timestamp = Math.floor(Date.now() / 1000);
        const response: LlamaOutputResponse = await ky.get(`${this.baseUrl()}/v1/out/${this.options.jobId}`, {
            headers: {
                'X-API-Key': this.options.apiKeyId,
                'X-Timestamp': timestamp,
                'X-Signature': this.generateSignature(timestamp, request)
            } as unknown as KyHeadersInit
        }).json() as LlamaOutputResponse;

        return response;
    }

    private generateSignature(timestamp: number, request: LlamaOutputRequest): string {
        const bodyHash = crypto.createHash("sha256").update(request.jobId).digest("hex");
        const body = `${bodyHash}${timestamp}`;
        return crypto.createHmac('sha256', this.options.apiKeySecret).update(body).digest("hex");
    }

    private baseUrl(): string {
        return process.env.LLAMAHAIR_BASE_URL || "https://api.llamahair.ai";
    }
}