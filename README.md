# LlamaHair Node.js Client

A Node.js client library for interacting with LlamaHair services. This library provides a simple interface for sending prompts and retrieving responses from the LlamaHair API.

## Installation

```bash
npm install @llamahair/client
```

## Quick Start

```typescript
import { LlamahairClient } from '@llamahair/client';

// Initialize the client
const client = new LlamahairClient({
    apiKeyId: 'your-api-key-id',
    apiKeySecret: 'your-api-key-secret'
});

// Send a prompt and get response in one call
const response = await client.sendAndRetrieve('https://your-prompt-url', {
    llama: {
        id: 'unique-id',
        body: 'Your prompt text'
    }
});

console.log(response.response.output);
```

## Authentication

The library uses a secure authentication mechanism that includes:
- API Key authentication (apiKeyId and apiKeySecret)
- Request signing (automatically handled by the client)
- Timestamp-based request validation

Each request to the API includes:
- `X-API-Key` header with your API key ID
- `X-Timestamp` header with the current timestamp
- `X-Signature` header with a request-specific signature

## Configuration

You can configure the client either through environment variables or by passing options to the constructor:

### Environment Variables
```bash
LLAMAHAIR_API_KEY_ID=your-api-key-id
LLAMAHAIR_API_SECRET=your-api-key-secret
LLAMAHAIR_BASE_URL=https://api.llamahair.ai  # Optional: defaults to https://api.llamahair.ai
```

### Constructor Options
```typescript
const client = new LlamahairClient({
    apiKeyId: 'your-api-key-id',
    apiKeySecret: 'your-api-key-secret'
});
```

## API Reference

### LlamahairClient

#### `send(promptUrl: string, request: LlamaSendRequest): Promise<LlamaSendResponse>`
Sends a prompt to the specified URL and returns a job ID.

```typescript
const jobIdResponse = await client.send('https://your-prompt-url', {
    llama: {
        id: 'unique-id',
        body: 'Your prompt text'
    }
});
```

#### `retrieve(request: LlamaOutputRequest): Promise<LlamaResponse>`
Retrieves the results for a specific job ID. This method implements a polling mechanism with a 45-second timeout. It will automatically retry until the response is ready or the timeout is reached.

```typescript
const response = await client.retrieve({ jobId: 'your-job-id' });
```

The retrieve operation can result in different statuses:
- `completed`: The request was successful and the response is available
- `failed`: The request failed (throws an error with details)
- Other statuses will trigger automatic retries until timeout

If the operation times out (after 45 seconds), an error will be thrown.

#### `sendAndRetrieve(promptUrl: string, request: LlamaSendRequest): Promise<LlamaResponse>`
Convenience method that combines send and retrieve operations.

```typescript
const response = await client.sendAndRetrieve('https://your-prompt-url', {
    llama: {
        id: 'unique-id',
        body: 'Your prompt text'
    }
});
```

### Response Types

The API can return different types of responses:

```typescript
type LlamaResponse = {
    type: "response";
    id: string;
    identifier: string;
    timestamp: number;
    response: {
        output?: string;         // Single string output
        outputs?: string[];      // Array of string outputs
        summary?: string;        // Summary of the response
        extracted_values?: {     // Key-value pairs of extracted data
            key: string,
            value: string
        }[];
    }
}
```

## Webhook Validation

The library includes a webhook validator for handling LlamaHair webhooks:

```typescript
import { LlamahairWebhookValidator } from '@llamahair/client';

const validator = new LlamahairWebhookValidator({
    secret: 'your-webhook-secret'
});

// Check if request needs validation
if (validator.shouldValidate(req)) {
    const signature = validator.validate({
        type: req.body.type,
        timestamp: req.body.timestamp,
        value: req.body.value
    });
    // Compare signature with request signature
}
```

## Error Handling

The library throws specific errors for different scenarios:
- Request timeout (after 45 seconds)
- Request failure with status details
- API authentication errors
- Network-related errors

It's recommended to wrap API calls in try-catch blocks:

```typescript
try {
    const response = await client.sendAndRetrieve('https://your-prompt-url', {
        llama: {
            id: 'unique-id',
            body: 'Your prompt text'
        }
    });
} catch (error) {
    console.error('Error:', error);
}
```
