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
const response = await client.sendAndRetreive('https://your-prompt-url', {
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

#### `retreive(request: LlamaOutputRequest): Promise<LlamaResponse>`
Retrieves the results for a specific job ID. This method implements a polling mechanism that:
- Automatically retries every 500ms until the response is ready
- Times out after 45 seconds of polling
- Handles different response statuses appropriately

```typescript
const response = await client.retreive({ jobId: 'your-job-id' });
```

The retreive operation can result in different statuses:
- `completed`: The request was successful and the response is available
- `failed`: The request failed (throws an error with details)
- Other statuses (like `pending`): Will trigger automatic retry after 250ms delay

The operation will:
- Return immediately if status is `completed`
- Throw an error if status is `failed`
- Throw an error if polling exceeds 45 seconds
- Automatically retry with 250ms delay for any other status

#### `sendAndRetreive(promptUrl: string, request: LlamaSendRequest): Promise<LlamaResponse>`
Convenience method that combines send and retreive operations.

```typescript
const response = await client.sendAndRetreive('https://your-prompt-url', {
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
    const response = await client.sendAndRetreive('https://your-prompt-url', {
        llama: {
            id: 'unique-id',
            body: 'Your prompt text'
        }
    });
} catch (error) {
    console.error('Error:', error);
}
```
