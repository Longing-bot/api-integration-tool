import * as fs from 'fs';
import * as path from 'path';

export interface ApiConfig {
  endpoint?: string;
  authToken?: string;
  defaultHeaders?: Record<string, string>;
  timeout?: number;
  retries?: number;
}

export class ConfigManager {
  private configPath: string;
  private config: ApiConfig = {};

  constructor() {
    this.configPath = path.join(process.cwd(), '.api-tool-config.json');
    this.loadConfig();
  }

  private loadConfig(): void {
    try {
      if (fs.existsSync(this.configPath)) {
        const data = fs.readFileSync(this.configPath, 'utf8');
        this.config = JSON.parse(data);
        console.log('📋 Loaded configuration from', this.configPath);
      } else {
        console.log('💡 No existing config found, using defaults');
      }
    } catch (error: any) {
      console.warn('⚠️ Error loading config:', error.message);
    }
  }

  saveConfig(): void {
    try {
      fs.writeFileSync(this.configPath, JSON.stringify(this.config, null, 2));
      console.log('💾 Configuration saved to', this.configPath);
    } catch (error: any) {
      console.error('❌ Error saving config:', error.message);
    }
  }

  setEndpoint(endpoint: string): void {
    this.config.endpoint = endpoint;
    this.saveConfig();
  }

  getEndpoint(): string | undefined {
    return this.config.endpoint;
  }

  setAuthToken(token: string): void {
    this.config.authToken = token;
    this.saveConfig();
  }

  getAuthToken(): string | undefined {
    return this.config.authToken;
  }

  setDefaultHeaders(headers: Record<string, string>): void {
    this.config.defaultHeaders = headers;
    this.saveConfig();
  }

  getDefaultHeaders(): Record<string, string> | undefined {
    return this.config.defaultHeaders;
  }

  setTimeout(timeout: number): void {
    this.config.timeout = timeout;
    this.saveConfig();
  }

  getTimeout(): number {
    return this.config.timeout || 30000;
  }

  setRetries(retries: number): void {
    this.config.retries = retries;
    this.saveConfig();
  }

  getRetries(): number {
    return this.config.retries || 3;
  }

  getAll(): ApiConfig {
    return { ...this.config };
  }

  update(config: Partial<ApiConfig>): void {
    Object.assign(this.config, config);
    this.saveConfig();
  }

  reset(): void {
    this.config = {};
    this.saveConfig();
  }

  validate(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (this.config.endpoint && !this.isValidUrl(this.config.endpoint)) {
      errors.push('Invalid endpoint URL format');
    }

    if (this.config.timeout && (this.config.timeout < 1000 || this.config.timeout > 300000)) {
      errors.push('Timeout must be between 1000ms and 5 minutes');
    }

    if (this.config.retries && (this.config.retries < 0 || this.config.retries > 10)) {
      errors.push('Retries must be between 0 and 10');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  private isValidUrl(string: string): boolean {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  }
}