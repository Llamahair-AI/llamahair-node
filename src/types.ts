export type LlamaClientApiKey = {
    apiKeyId: string;
    apiKeySecret: string;
}

export type LlamaClientOptions = LlamaClientApiKey;

export type LlamaSendClientOptions = {
    promptUrl: string;
} & LlamaClientApiKey;

export type LlamaRetreiveClientOptions = {
    jobId: string;
} & LlamaClientApiKey;

export type LlamaSendRequest = {
    id: string;
    body: string;
}

export type LlamaSendResponse = {
    jobId: string;
}

export type LlamaOutputRequest = LlamaSendResponse;

export type LlamaOutputResponse = {
    status: string;
    start_time: number;
    end_time?: number;
    response: LlamaResponse;
    prompt_id: string;
    team_id: string;
}

export type LlamaResponse = {
    type: "response";
    id: string;
    identifier: string;
    timestamp: number;
    response: {
        output?: string;
        outputs?: string[];
        summary?: string;
        extracted_values?: { key: string, value: string }[];
    }
}
