import {LlamaSendClient} from "./llama-send-client";
import {LlamaClientOptions, LlamaOutputRequest, LlamaResponse, LlamaSendRequest, LlamaSendResponse} from "./types";
import {LlamaRetrieveClient} from "./llama-retrieve-client";

class LlamaClient {
    private readonly apiKeyId: string;
    private readonly apiKeySecret: string;

    constructor(private readonly options: LlamaClientOptions) {
        this.apiKeyId = process.env.LLAMAHAIR_API_KEY_ID || options.apiKeyId;
        this.apiKeySecret = process.env.LLAMAHAIR_API_SECRET || options.apiKeySecret;
    }

    public send(promptUrl: string, request: LlamaSendRequest): Promise<LlamaSendResponse> {
        const client = new LlamaSendClient({
            promptUrl,
            apiKeyId: this.apiKeyId,
            apiKeySecret: this.apiKeySecret,
        });

        return client.send(request);
    }

    public retrieve(request: LlamaOutputRequest): Promise<LlamaResponse> {
        const client = new LlamaRetrieveClient({
            jobId: request.jobId,
            apiKeyId: this.apiKeyId,
            apiKeySecret: this.apiKeySecret,
        });

        return client.retreive(request);
    }

    public async sendAndRetrieve(promptUrl: string, request: LlamaSendRequest): Promise<LlamaResponse> {
        const jobIdResponse = await this.send(promptUrl, request);
        return this.retrieve(jobIdResponse as LlamaOutputRequest)
    }
}