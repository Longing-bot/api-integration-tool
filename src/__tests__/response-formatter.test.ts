import { ResponseFormatter } from '../response-formatter';

// Mock chalk (ESM module)
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

describe('ResponseFormatter', () => {
  let formatter: ResponseFormatter;

  beforeEach(() => {
    formatter = new ResponseFormatter();
  });

  describe('format', () => {
    it('should return string as-is', () => {
      expect(formatter.format('hello')).toBe('hello');
    });

    it('should format a detailed response with status', () => {
      const result = formatter.format({ status: 'healthy', data: { key: 'value' } });
      expect(result).toContain('HEALTHY');
      expect(result).toContain('key');
    });

    it('should format an array response', () => {
      const result = formatter.format([1, 2, 3]);
      expect(result).toContain('3 items');
    });

    it('should format empty array', () => {
      const result = formatter.format([]);
      expect(result).toContain('Empty array');
    });

    it('should format an object response', () => {
      const result = formatter.format({ name: 'test', value: 42 });
      expect(result).toContain('name');
      expect(result).toContain('test');
    });

    it('should format empty object', () => {
      const result = formatter.format({});
      expect(result).toContain('Empty object');
    });

    it('should format primitive values', () => {
      expect(formatter.format(42)).toBe('42');
      expect(formatter.format(true)).toBe('true');
    });
  });

  describe('formatBatchResult', () => {
    it('should format batch results with successes', () => {
      const result = formatter.formatBatchResult({
        total: 3,
        successful: 2,
        failed: 1,
        results: [
          { id: 'op1', success: true, data: { result: 'ok' } },
          { id: 'op2', success: true, data: { result: 'ok' } },
          { id: 'op3', success: false, error: 'timeout' }
        ]
      });
      expect(result).toContain('3');
      expect(result).toContain('2');
      expect(result).toContain('1');
      expect(result).toContain('op1');
      expect(result).toContain('timeout');
    });
  });

  describe('formatHealthCheck', () => {
    it('should format healthy status', () => {
      const result = formatter.formatHealthCheck({
        status: 'healthy',
        responseTime: 150,
        endpoint: '/health',
        statusCode: 200
      });
      expect(result).toContain('HEALTHY');
      expect(result).toContain('150');
      expect(result).toContain('/health');
    });

    it('should format unhealthy status with error', () => {
      const result = formatter.formatHealthCheck({
        status: 'unhealthy',
        error: 'Connection refused',
        responseTime: 5000
      });
      expect(result).toContain('UNHEALTHY');
      expect(result).toContain('Connection refused');
    });
  });
});
