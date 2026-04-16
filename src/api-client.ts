import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import chalk from 'chalk';

export interface ApiRequest {
  method: string;
  url: string;
  data?: any;
  headers?: Record<string, string>;
  timeout?: number;
}

export interface BatchOperation {
  id: string;
  method: string;
  url: string;
  data?: any;
  priority?: 'high' | 'medium' | 'low';
}

export interface BatchResult {
  successful: number;
  failed: number;
  total: number;
  results: Array<{ id: string; success: boolean; data?: any; error?: string }>;
}

export class ApiClient {
  private client: AxiosInstance;
  private requestCount = 0;

  constructor() {
    this.client = axios.create({
      timeout: 30000,
      headers: {
        'User-Agent': 'API-Tool/1.0.0',
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    // Request interceptor for logging
    this.client.interceptors.request.use((config) => {
      this.requestCount++;
      console.log(chalk.gray(`📤 [${this.requestCount}] ${config.method?.toUpperCase()} ${config.url}`));
      return config;
    });

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response) {
          console.error(chalk.red(`❌ HTTP ${error.response.status}: ${error.config?.url}`));
        } else if (error.request) {
          console.error(chalk.red(`🚫 Network Error: ${error.message}`));
        } else {
          console.error(chalk.red(`💥 Request Error: ${error.message}`));
        }
        throw error;
      }
    );
  }

  async request(config: ApiRequest): Promise<AxiosResponse> {
    const requestConfig: AxiosRequestConfig = {
      method: config.method.toLowerCase(),
      url: config.url,
      data: config.data,
      headers: config.headers,
      timeout: config.timeout || 30000
    };

    return await this.client(requestConfig);
  }

  async batchExecute(operations: BatchOperation[], parallel: boolean = false): Promise<BatchResult> {
    console.log(chalk.cyan(`📦 Executing ${operations.length} operations...`));

    let results: Array<{ id: string; success: boolean; data?: any; error?: string }> = [];

    if (parallel) {
      // Execute in parallel with concurrency limit
      const concurrentLimit = 5;
      const chunks = this.chunkArray(operations, concurrentLimit);

      for (const chunk of chunks) {
        const chunkResults = await Promise.allSettled(
          chunk.map(async (op) => {
            try {
              const response = await this.request({
                method: op.method,
                url: op.url,
                data: op.data
              });
              return { id: op.id, success: true, data: response.data };
            } catch (error) {
              return { id: op.id, success: false, error: error.message };
            }
          })
        );

        results.push(...chunkResults.map(result =>
          result.status === 'fulfilled'
            ? result.value
            : { id: 'unknown', success: false, error: 'Unknown error' }
        ));
      }
    } else {
      // Execute sequentially
      for (const operation of operations) {
        try {
          const response = await this.request({
            method: operation.method,
            url: operation.url,
            data: operation.data
          });
          results.push({ id: operation.id, success: true, data: response.data });
        } catch (error) {
          results.push({ id: operation.id, success: false, error: error.message });
        }
      }
    }

    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    console.log(chalk.green(`✅ Batch completed: ${successful}/${results.length} successful`));

    return {
      successful,
      failed,
      total: results.length,
      results
    };
  }

  async checkHealth(timeout: number = 5000): Promise<any> {
    console.log(chalk.cyan('🏥 Checking API health...'));

    const startTime = Date.now();

    try {
      // Try common health endpoints
      const healthEndpoints = [
        '/health',
        '/api/health',
        '/status',
        '/ping',
        '/api/v1/health'
      ];

      for (const endpoint of healthEndpoints) {
        try {
          const response = await this.client.get(endpoint, { timeout });
          const duration = Date.now() - startTime;
          
          return {
            status: 'healthy',
            endpoint,
            responseTime: duration,
            statusCode: response.status,
            data: response.data
          };
        } catch (error) {
          continue; // Try next endpoint
        }
      }

      throw new Error('No healthy endpoints found');
      
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        responseTime: Date.now() - startTime
      };
    }
  }

  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  async getStats(): Promise<any> {
    return {
      requestsMade: this.requestCount,
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage()
    };
  }
}