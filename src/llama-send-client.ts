import * as crypto from "node:crypto";
import {LlamaSendClientOptions, LlamaSendRequest, LlamaSendResponse} from "./types";
import ky from "ky";
import {KyHeadersInit} from "ky/distribution/types/options";

export class LlamaSendClient {
    constructor(readonly options: LlamaSendClientOptions) {}

    public async send(request: LlamaSendRequest): Promise<LlamaSendResponse> {
        return this.makeRequest(request);
    }

    private async makeRequest(request: LlamaSendRequest): Promise<LlamaSendResponse> {
        const timestamp = Math.floor(Date.now() / 1000);
        return new Promise<LlamaSendResponse>(async (resolve, reject) => {
            try {
                const data = await ky.post(this.options.promptUrl, {
                    json: {
                        id: request.id,
                        body: request.body,
                    },
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'X-API-Key': this.options.apiKeyId,
                        'X-Timestamp': timestamp,
                        'X-Signature': this.generateSignature(timestamp, request),
                    } as unknown as KyHeadersInit
                }).json();

                resolve({ jobId: (data as unknown as any).job_id } as LlamaSendResponse);
            } catch (error: unknown) {
                reject(error);
            }
        });
    }

    private generateSignature(timestamp: number, request: LlamaSendRequest): string {
        const bodyHash = crypto.createHash('sha256').update(JSON.stringify(request)).digest('hex');
        const data = `${bodyHash}${timestamp}`;
        return crypto.createHmac('sha256', this.options.apiKeySecret).update(data).digest('hex');
    }
}