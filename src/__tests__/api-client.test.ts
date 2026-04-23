// Mock chalk (ESM module) before any imports
jest.mock('chalk', () => {
  const identity = (s: any) => s;
  return {
    __esModule: true,
    default: new Proxy({}, {
      get: () => new Proxy(identity, {
        get: () => identity
      })
    })
  };
});

// Mock axios before importing ApiClient
const mockRequest = jest.fn();
const mockGet = jest.fn();
jest.mock('axios', () => ({
  __esModule: true,
  default: {
    create: jest.fn(() => ({
      get: mockGet,
      post: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
      interceptors: {
        request: { use: jest.fn() },
        response: { use: jest.fn() }
      }
    }))
  }
}));

import { ApiClient } from '../api-client';

describe('ApiClient', () => {
  let client: ApiClient;

  beforeEach(() => {
    jest.clearAllMocks();
    client = new ApiClient();
  });

  describe('constructor', () => {
    it('should create an instance', () => {
      expect(client).toBeDefined();
    });
  });

  describe('getStats', () => {
    it('should return stats object', async () => {
      const stats = await client.getStats();
      expect(stats).toHaveProperty('requestsMade');
      expect(stats).toHaveProperty('uptime');
      expect(stats).toHaveProperty('memoryUsage');
      expect(typeof stats.requestsMade).toBe('number');
    });
  });

  describe('batchExecute', () => {
    it('should execute operations sequentially', async () => {
      // Mock the request method on the client instance
      const mockRequestFn = jest.spyOn(client, 'request');
      mockRequestFn
        .mockResolvedValueOnce({ data: { id: 1 } } as any)
        .mockResolvedValueOnce({ data: { id: 2 } } as any);

      const result = await client.batchExecute([
        { id: 'op1', method: 'get', url: 'https://api.test.com/1' },
        { id: 'op2', method: 'get', url: 'https://api.test.com/2' }
      ]);

      expect(result.total).toBe(2);
      expect(result.successful).toBe(2);
      expect(result.failed).toBe(0);
      mockRequestFn.mockRestore();
    });

    it('should handle failures in batch', async () => {
      const mockRequestFn = jest.spyOn(client, 'request');
      mockRequestFn
        .mockResolvedValueOnce({ data: { id: 1 } } as any)
        .mockRejectedValueOnce(new Error('Network error'));

      const result = await client.batchExecute([
        { id: 'op1', method: 'get', url: 'https://api.test.com/1' },
        { id: 'op2', method: 'get', url: 'https://api.test.com/2' }
      ]);

      expect(result.total).toBe(2);
      expect(result.successful).toBe(1);
      expect(result.failed).toBe(1);
      mockRequestFn.mockRestore();
    });
  });
});
