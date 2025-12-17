import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { LockManager } from '../src/lock';

describe('LockManager', () => {
  let lockManager: LockManager;
  let mockSet: ReturnType<typeof vi.fn>;
  let mockEval: ReturnType<typeof vi.fn>;
  let mockQuit: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();

    // Create mock Redis instance
    mockSet = vi.fn();
    mockEval = vi.fn();
    mockQuit = vi.fn().mockResolvedValue('OK');

    const mockRedisInstance = {
      set: mockSet,
      eval: mockEval,
      quit: mockQuit,
    };

    // Create LockManager with mock
    lockManager = new LockManager(mockRedisInstance as any);
  });

  afterEach(async () => {
    await lockManager.quit();
  });

  describe('acquire', () => {
    it('should acquire lock successfully', async () => {
      mockSet.mockResolvedValue('OK');

      const lock = await lockManager.acquire('test-lock');

      expect(lock).not.toBeNull();
      expect(lock?.key).toBe('test-lock');
      expect(lock?.value).toBeDefined();
      expect(mockSet).toHaveBeenCalledWith(
        'test-lock',
        expect.any(String),
        'PX',
        expect.any(Number),
        'NX',
      );
    });

    it('should return null when lock is already held', async () => {
      mockSet.mockResolvedValue(null);

      const lock = await lockManager.acquire('test-lock');

      expect(lock).toBeNull();
    });

    it('should retry on failure', async () => {
      mockSet.mockResolvedValueOnce(null).mockResolvedValueOnce(null).mockResolvedValueOnce('OK');

      const lock = await lockManager.acquire('test-lock');

      expect(lock).not.toBeNull();
      expect(mockSet).toHaveBeenCalledTimes(3);
    });

    it('should use custom timeout', async () => {
      mockSet.mockResolvedValue('OK');

      await lockManager.acquire('test-lock', 5000);

      expect(mockSet).toHaveBeenCalledWith('test-lock', expect.any(String), 'PX', 5000, 'NX');
    });
  });

  describe('release', () => {
    it('should release lock successfully', async () => {
      mockEval.mockResolvedValue(1);

      const result = await lockManager.release('test-lock', 'test-value');

      expect(result).toBe(true);
      expect(mockEval).toHaveBeenCalledWith(
        expect.stringContaining('redis.call("get"'),
        1,
        'test-lock',
        'test-value',
      );
    });

    it('should return false when lock was not held', async () => {
      mockEval.mockResolvedValue(0);

      const result = await lockManager.release('test-lock', 'wrong-value');

      expect(result).toBe(false);
    });
  });

  describe('extend', () => {
    it('should extend lock successfully', async () => {
      mockEval.mockResolvedValue(1);

      const result = await lockManager.extend('test-lock', 'test-value', 5000);

      expect(result).toBe(true);
      expect(mockEval).toHaveBeenCalledWith(
        expect.stringContaining('redis.call("pexpire"'),
        1,
        'test-lock',
        'test-value',
        '5000',
      );
    });
  });

  describe('using', () => {
    it('should execute function within lock', async () => {
      mockSet.mockResolvedValue('OK');
      mockEval.mockResolvedValue(1);

      const fn = vi.fn().mockResolvedValue('result');
      const result = await lockManager.using('test-lock', fn);

      expect(result).toBe('result');
      expect(fn).toHaveBeenCalled();
      expect(mockSet).toHaveBeenCalled();
      expect(mockEval).toHaveBeenCalled(); // unlock was called
    });

    it('should release lock even on error', async () => {
      mockSet.mockResolvedValue('OK');
      mockEval.mockResolvedValue(1);

      const fn = vi.fn().mockRejectedValue(new Error('Test error'));

      await expect(lockManager.using('test-lock', fn)).rejects.toThrow('Test error');
      expect(mockEval).toHaveBeenCalled(); // unlock was called
    });

    it('should throw error when lock cannot be acquired', async () => {
      mockSet.mockResolvedValue(null);

      const fn = vi.fn().mockResolvedValue('result');

      await expect(lockManager.using('test-lock', fn)).rejects.toThrow('Failed to acquire lock');
      expect(fn).not.toHaveBeenCalled();
    });
  });
});
