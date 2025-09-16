import type { z } from "zod";

export type RequestResponsePair<TRequest = unknown, TResponse = unknown> = {
  name: string;
  request: TRequest;
  responseSchema?: z.ZodSchema<TResponse>;
  responseMatch?: (response: unknown) => boolean;
  timeoutMs?: number;
  retryConfig?: {
    maxAttempts: number;
    delayMs: number;
    backoffMultiplier?: number;
  };
};

export class RequestResponseManager<BaseMessageType = unknown> {
  private pendingRequests = new Map<
    string,
    {
      resolve: (value: unknown) => void;
      reject: (error: Error) => void;
      timeoutId: NodeJS.Timeout;
      pair: RequestResponsePair;
    }
  >();

  private messageHandlers = new Map<
    (message: unknown) => boolean,
    (message: unknown, peerId: string) => void
  >();

  private sendMessage: (message: BaseMessageType) => void = () => {
    throw new Error("sendMessage function not configured");
  };

  async executeRequestResponse<
    TRequest extends BaseMessageType,
    TResponse extends BaseMessageType,
  >(
    pair: RequestResponsePair<TRequest, TResponse>,
    requestId: string = this.generateRequestId(),
  ): Promise<TResponse> {
    return new Promise<TResponse>((resolve, reject) => {
      const timeoutMs = pair.timeoutMs ?? 30000;

      const timeoutId = setTimeout(() => {
        this.pendingRequests.delete(requestId);
        reject(
          new Error(`Request "${pair.name}" timed out after ${timeoutMs}ms`),
        );
      }, timeoutMs);

      this.pendingRequests.set(requestId, {
        resolve: (value: unknown) => resolve(value as TResponse),
        reject,
        timeoutId,
        pair,
      });

      this.sendMessage(pair.request);
    });
  }

  async executeWithRetry<
    TRequest extends BaseMessageType,
    TResponse extends BaseMessageType,
  >(
    pair: RequestResponsePair<TRequest, TResponse>,
    requestId?: string,
  ): Promise<TResponse> {
    const retryConfig = pair.retryConfig ?? { maxAttempts: 1, delayMs: 0 };
    let lastError: Error | undefined;

    for (let attempt = 1; attempt <= retryConfig.maxAttempts; attempt++) {
      try {
        return await this.executeRequestResponse(pair, requestId);
      } catch (error) {
        lastError = error as Error;

        if (attempt < retryConfig.maxAttempts) {
          const delay =
            retryConfig.delayMs *
            (retryConfig.backoffMultiplier ?? 1) ** (attempt - 1);
          await this.delay(delay);
        }
      }
    }

    throw lastError ?? new Error("Request execution failed");
  }

  processIncomingMessage(message: BaseMessageType, peerId: string): boolean {
    for (const [requestId, pendingRequest] of this.pendingRequests) {
      const { pair, resolve, timeoutId } = pendingRequest;

      if (this.matchesResponse(message, pair)) {
        clearTimeout(timeoutId);
        this.pendingRequests.delete(requestId);
        resolve(message);
        return true;
      }
    }

    for (const [typeChecker, handler] of this.messageHandlers) {
      if (typeChecker(message)) {
        handler(message, peerId);
        return true;
      }
    }

    return false;
  }

  registerMessageHandler<T extends BaseMessageType>(
    typeChecker: (message: unknown) => message is T,
    handler: (message: T, peerId: string) => void,
  ): void {
    this.messageHandlers.set(
      typeChecker as (message: unknown) => boolean,
      handler as (message: unknown, peerId: string) => void,
    );
  }

  configureSendFunction(sendFn: (message: BaseMessageType) => void): void {
    this.sendMessage = sendFn;
  }

  clearPendingRequests(): void {
    for (const [_, pendingRequest] of this.pendingRequests) {
      clearTimeout(pendingRequest.timeoutId);
      pendingRequest.reject(new Error("Request cancelled"));
    }
    this.pendingRequests.clear();
  }

  private matchesResponse(
    message: unknown,
    pair: RequestResponsePair,
  ): boolean {
    if (pair.responseMatch) {
      return pair.responseMatch(message);
    }

    if (pair.responseSchema) {
      const result = pair.responseSchema.safeParse(message);
      return result.success;
    }

    return false;
  }

  private generateRequestId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

export class RequestResponseBuilder<TRequest = object, TResponse = object> {
  private pair: Partial<RequestResponsePair<TRequest, TResponse>> = {};

  static create<TRequest, TResponse>(
    name: string,
  ): RequestResponseBuilder<TRequest, TResponse> {
    const builder = new RequestResponseBuilder<TRequest, TResponse>();
    builder.pair.name = name;
    return builder;
  }

  withRequest(request: TRequest): this {
    this.pair.request = request;
    return this;
  }

  expectResponse(schema: z.ZodSchema<TResponse>): this {
    this.pair.responseSchema = schema;
    return this;
  }

  expectResponseMatching(matcher: (response: unknown) => boolean): this {
    this.pair.responseMatch = matcher;
    return this;
  }

  withTimeout(ms: number): this {
    this.pair.timeoutMs = ms;
    return this;
  }

  withRetry(config: {
    maxAttempts: number;
    delayMs: number;
    backoffMultiplier?: number;
  }): this {
    this.pair.retryConfig = config;
    return this;
  }

  build(): RequestResponsePair<TRequest, TResponse> {
    if (!this.pair.name || !this.pair.request) {
      throw new Error("Request name and request data are required");
    }
    return this.pair as RequestResponsePair<TRequest, TResponse>;
  }
}
