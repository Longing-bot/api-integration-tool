import { ConfigManager } from '../config-manager';
import * as fs from 'fs';
import * as path from 'path';

// Mock fs to avoid file system side effects
jest.mock('fs');

describe('ConfigManager', () => {
  let configManager: ConfigManager;
  const mockConfigPath = path.join(process.cwd(), '.api-tool-config.json');

  beforeEach(() => {
    jest.clearAllMocks();
    (fs.existsSync as jest.Mock).mockReturnValue(false);
    (fs.readFileSync as jest.Mock).mockReturnValue('');
    (fs.writeFileSync as jest.Mock).mockImplementation(() => {});
    configManager = new ConfigManager();
  });

  describe('constructor', () => {
    it('should create instance with defaults when no config file exists', () => {
      expect(configManager).toBeDefined();
      expect(configManager.getEndpoint()).toBeUndefined();
      expect(configManager.getAuthToken()).toBeUndefined();
    });

    it('should load config from file when it exists', () => {
      const configData = JSON.stringify({
        endpoint: 'https://api.example.com',
        authToken: 'test-token',
        timeout: 5000
      });
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readFileSync as jest.Mock).mockReturnValue(configData);

      const cm = new ConfigManager();
      expect(cm.getEndpoint()).toBe('https://api.example.com');
      expect(cm.getAuthToken()).toBe('test-token');
      expect(cm.getTimeout()).toBe(5000);
    });
  });

  describe('setEndpoint / getEndpoint', () => {
    it('should set and get endpoint', () => {
      configManager.setEndpoint('https://api.test.com');
      expect(configManager.getEndpoint()).toBe('https://api.test.com');
      expect(fs.writeFileSync).toHaveBeenCalled();
    });
  });

  describe('setAuthToken / getAuthToken', () => {
    it('should set and get auth token', () => {
      configManager.setAuthToken('my-secret-token');
      expect(configManager.getAuthToken()).toBe('my-secret-token');
    });
  });

  describe('setTimeout / getTimeout', () => {
    it('should return default timeout of 30000', () => {
      expect(configManager.getTimeout()).toBe(30000);
    });

    it('should set custom timeout', () => {
      configManager.setTimeout(10000);
      expect(configManager.getTimeout()).toBe(10000);
    });
  });

  describe('setRetries / getRetries', () => {
    it('should return default retries of 3', () => {
      expect(configManager.getRetries()).toBe(3);
    });

    it('should set custom retries', () => {
      configManager.setRetries(5);
      expect(configManager.getRetries()).toBe(5);
    });
  });

  describe('setDefaultHeaders / getDefaultHeaders', () => {
    it('should set and get default headers', () => {
      const headers = { 'X-Custom': 'value', Authorization: 'Bearer token' };
      configManager.setDefaultHeaders(headers);
      expect(configManager.getDefaultHeaders()).toEqual(headers);
    });
  });

  describe('getAll', () => {
    it('should return a copy of all config', () => {
      configManager.setEndpoint('https://test.com');
      const all = configManager.getAll();
      expect(all.endpoint).toBe('https://test.com');
      // Should be a copy, not a reference
      all.endpoint = 'mutated';
      expect(configManager.getEndpoint()).toBe('https://test.com');
    });
  });

  describe('update', () => {
    it('should merge partial config', () => {
      configManager.update({ endpoint: 'https://new.com', timeout: 5000 });
      expect(configManager.getEndpoint()).toBe('https://new.com');
      expect(configManager.getTimeout()).toBe(5000);
    });
  });

  describe('reset', () => {
    it('should clear all config', () => {
      configManager.setEndpoint('https://test.com');
      configManager.setAuthToken('token');
      configManager.reset();
      expect(configManager.getEndpoint()).toBeUndefined();
      expect(configManager.getAuthToken()).toBeUndefined();
    });
  });

  describe('validate', () => {
    it('should return valid for empty config', () => {
      const result = configManager.validate();
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should return valid for valid config', () => {
      configManager.setEndpoint('https://api.example.com');
      configManager.setTimeout(5000);
      configManager.setRetries(3);
      const result = configManager.validate();
      expect(result.valid).toBe(true);
    });

    it('should reject invalid URL', () => {
      configManager.setEndpoint('not-a-url');
      const result = configManager.validate();
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Invalid endpoint URL format');
    });

    it('should reject timeout too low', () => {
      configManager.setTimeout(500);
      const result = configManager.validate();
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Timeout must be between 1000ms and 5 minutes');
    });

    it('should reject timeout too high', () => {
      configManager.setTimeout(600000);
      const result = configManager.validate();
      expect(result.valid).toBe(false);
    });

    it('should reject negative retries', () => {
      configManager.setRetries(-1);
      const result = configManager.validate();
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Retries must be between 0 and 10');
    });

    it('should reject retries > 10', () => {
      configManager.setRetries(11);
      const result = configManager.validate();
      expect(result.valid).toBe(false);
    });
  });
});
