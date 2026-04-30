/**
 * Testes unitários para o serviço de retry com backoff exponencial
 */

import { executeWithRetry, fetchWithRetry, PaymentGatewayClient } from '../lib/services/retry.service';

describe('Retry Service', () => {
  describe('executeWithRetry', () => {
    it('deve retornar sucesso na primeira tentativa', async () => {
      const mockFn = jest.fn().mockResolvedValue('success');
      
      const result = await executeWithRetry(mockFn, { maxRetries: 3 });
      
      expect(result.success).toBe(true);
      expect(result.data).toBe('success');
      expect(result.attempts).toBe(1);
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('deve retry até o sucesso', async () => {
      const mockFn = jest.fn()
        .mockRejectedValueOnce(new Error('Attempt 1 failed'))
        .mockRejectedValueOnce(new Error('Attempt 2 failed'))
        .mockResolvedValueOnce('success on 3rd');
      
      const result = await executeWithRetry(mockFn, { 
        maxRetries: 3,
        initialDelay: 10 // Fast retry for tests
      });
      
      expect(result.success).toBe(true);
      expect(result.data).toBe('success on 3rd');
      expect(result.attempts).toBe(3);
      expect(mockFn).toHaveBeenCalledTimes(3);
    });

    it('deve falhar após todas as tentativas', async () => {
      const mockFn = jest.fn().mockRejectedValue(new Error('Always fails'));
      
      const result = await executeWithRetry(mockFn, { 
        maxRetries: 2,
        initialDelay: 10
      });
      
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.attempts).toBe(3); // Initial + 2 retries
      expect(mockFn).toHaveBeenCalledTimes(3);
    });

    it('não deve fazer retry para erros 400/401/403', async () => {
      const mockFn = jest.fn().mockRejectedValue(new Error('400 Bad Request'));
      
      const result = await executeWithRetry(mockFn, { maxRetries: 3 });
      
      expect(result.success).toBe(false);
      expect(result.attempts).toBe(1); // Only one attempt, no retries
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('deve aplicar backoff exponencial', async () => {
      const mockFn = jest.fn().mockRejectedValue(new Error('Fail'));
      const startTime = Date.now();
      
      await executeWithRetry(mockFn, { 
        maxRetries: 2,
        initialDelay: 100,
        backoffMultiplier: 2
      });
      
      const elapsed = Date.now() - startTime;
      
      // Should wait at least 100ms + 200ms = 300ms (with some tolerance)
      expect(elapsed).toBeGreaterThanOrEqual(250);
      expect(mockFn).toHaveBeenCalledTimes(3);
    });
  });

  describe('PaymentGatewayClient', () => {
    let client: PaymentGatewayClient;
    let originalFetch: typeof global.fetch;

    beforeEach(() => {
      client = new PaymentGatewayClient(
        'https://api.example.com',
        'test-api-key',
        { maxRetries: 2, initialDelay: 10 }
      );
      
      originalFetch = global.fetch;
      global.fetch = jest.fn();
    });

    afterEach(() => {
      global.fetch = originalFetch;
    });

    it('deve fazer POST com retry automático', async () => {
      const mockResponse = { id: '123', status: 'created' };
      
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });
      
      const result = await client.post('/payments', { amount: 100 });
      
      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.example.com/payments',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-api-key',
            'Content-Type': 'application/json',
          }),
        })
      );
    });

    it('deve fazer GET com retry automático', async () => {
      const mockResponse = { id: '123', status: 'paid' };
      
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });
      
      const result = await client.get('/payments/123');
      
      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.example.com/payments/123',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-api-key',
          }),
        })
      );
    });

    it('deve retry em caso de falha temporária', async () => {
      const mockResponse = { id: '123', status: 'created' };
      
      (global.fetch as jest.Mock)
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockResponse,
        });
      
      const result = await client.post('/payments', { amount: 100 });
      
      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });
  });
});

// Mock do Jest
jest.mock('../lib/prisma', () => ({
  prisma: {
    payment: {
      findFirst: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
    },
    order: {
      update: jest.fn(),
      create: jest.fn(),
    },
    $transaction: jest.fn((ops) => Promise.all(ops)),
  },
}));
