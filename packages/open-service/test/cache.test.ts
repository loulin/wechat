import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getCache, resetCache } from '../src/cache';

// Mock cache-manager and keyv
vi.mock('cache-manager', () => ({
  createCache: vi.fn(() => ({
    get: vi.fn(),
    set: vi.fn(),
    del: vi.fn(),
    wrap: vi.fn(),
  })),
}));

vi.mock('keyv', () => ({
  Keyv: vi.fn(() => ({})),
}));

vi.mock('@keyv/valkey', () => ({
  default: vi.fn(() => ({})),
}));

describe('Cache Module', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetCache();
  });

  describe('getCache', () => {
    it('should create cache with single node config', () => {
      const cache = getCache({ host: 'localhost', port: 6379 });
      expect(cache).toBeDefined();
    });

    it('should create cache with password', () => {
      const cache = getCache({
        host: 'localhost',
        port: 6379,
        password: 'secret',
        db: 1,
      });
      expect(cache).toBeDefined();
    });

    it('should create cache with cluster config', () => {
      const cache = getCache([
        { host: 'node1', port: 6379 },
        { host: 'node2', port: 6379 },
      ]);
      expect(cache).toBeDefined();
    });

    it('should return same instance on second call', () => {
      const cache1 = getCache({ host: 'localhost', port: 6379 });
      const cache2 = getCache({ host: 'other', port: 6380 });
      expect(cache1).toBe(cache2);
    });

    it('should create cache with namespace option', () => {
      const cache = getCache({ host: 'localhost', port: 6379 }, { namespace: 'test' });
      expect(cache).toBeDefined();
    });

    it('should create cache with TTL option', () => {
      const cache = getCache({ host: 'localhost', port: 6379 }, { ttl: 3600 });
      expect(cache).toBeDefined();
    });
  });

  describe('resetCache', () => {
    it('should allow creating new cache after reset', () => {
      const cache1 = getCache({ host: 'localhost', port: 6379 });
      resetCache();
      const cache2 = getCache({ host: 'localhost', port: 6379 });
      // After reset, the mock creates a new object
      expect(cache1).not.toBe(cache2);
    });
  });
});
