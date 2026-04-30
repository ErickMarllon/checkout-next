/**
 * Testes de integração para webhook do PagLoop
 */

import { POST } from '../app/api/pagloop/webhook/route';
import { NextRequest } from 'next/server';
import { createHmac } from 'crypto';

// Mock do Prisma
jest.mock('../lib/prisma', () => ({
  prisma: {
    payment: {
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    order: {
      update: jest.fn(),
    },
    $transaction: jest.fn((ops) => Promise.all(ops)),
  },
}));

describe('Webhook Integration Tests', () => {
  const WEBHOOK_SECRET = 'test-webhook-secret';
  
  beforeAll(() => {
    process.env.PAGLOOP_WEBHOOK_SECRET = WEBHOOK_SECRET;
  });

  afterAll(() => {
    delete process.env.PAGLOOP_WEBHOOK_SECRET;
  });

  function createSignedPayload(payload: object): { body: string; signature: string } {
    const body = JSON.stringify(payload);
    const signature = createHmac('sha256', WEBHOOK_SECRET)
      .update(body)
      .digest('hex');
    return { body, signature };
  }

  function createMockRequest(body: string, signature: string): NextRequest {
    return new NextRequest(new Request('http://localhost:3000/api/pagloop/webhook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-pagloop-signature': signature,
      },
      body,
    }));
  }

  describe('Validação de Assinatura', () => {
    it('deve rejeitar webhook com assinatura inválida', async () => {
      const payload = { event: 'checkout.paid', data: { checkoutId: '123' } };
      const invalidSignature = 'invalid-signature';
      
      const req = createMockRequest(JSON.stringify(payload), invalidSignature);
      const response = await POST(req);
      
      expect(response.status).toBe(401);
      const json = await response.json();
      expect(json.error).toBe('Invalid signature');
    });

    it('deve aceitar webhook com assinatura válida', async () => {
      const payload = { 
        event: 'checkout.paid', 
        data: { checkoutId: 'test-checkout-id', status: 'paid' } 
      };
      const { body, signature } = createSignedPayload(payload);
      
      // Mock do payment lookup
      const { prisma } = require('../lib/prisma');
      prisma.payment.findFirst.mockResolvedValue({
        id: 'payment-123',
        orderId: 'order-123',
        status: 'PENDING',
        providerRef: 'test-checkout-id',
      });
      prisma.payment.update.mockResolvedValue({});
      prisma.order.update.mockResolvedValue({});
      
      const req = createMockRequest(body, signature);
      const response = await POST(req);
      
      expect(response.status).toBe(200);
      const json = await response.json();
      expect(json.ok).toBe(true);
    });

    it('deve falhar se PAGLOOP_WEBHOOK_SECRET não estiver configurado', async () => {
      delete process.env.PAGLOOP_WEBHOOK_SECRET;
      
      const payload = { event: 'checkout.paid', data: { checkoutId: '123' } };
      const { body, signature } = createSignedPayload(payload);
      
      const req = createMockRequest(body, signature);
      
      await expect(POST(req)).rejects.toThrow(
        'PAGLOOP_WEBHOOK_SECRET is not configured'
      );
      
      // Restaurar secret
      process.env.PAGLOOP_WEBHOOK_SECRET = WEBHOOK_SECRET;
    });
  });

  describe('Processamento de Eventos', () => {
    const { prisma } = require('../lib/prisma');

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('deve processar evento checkout.paid corretamente', async () => {
      const payload = { 
        event: 'checkout.paid', 
        data: { checkoutId: 'test-checkout-id', status: 'paid' } 
      };
      const { body, signature } = createSignedPayload(payload);
      
      prisma.payment.findFirst.mockResolvedValue({
        id: 'payment-123',
        orderId: 'order-123',
        status: 'PENDING',
        providerRef: 'test-checkout-id',
      });
      
      const req = createMockRequest(body, signature);
      const response = await POST(req);
      
      expect(response.status).toBe(200);
      expect(prisma.$transaction).toHaveBeenCalledWith([
        expect.objectContaining({}),
        expect.objectContaining({}),
      ]);
    });

    it('deve ser idempotente para pagamentos já confirmados', async () => {
      const payload = { 
        event: 'checkout.paid', 
        data: { checkoutId: 'test-checkout-id', status: 'paid' } 
      };
      const { body, signature } = createSignedPayload(payload);
      
      prisma.payment.findFirst.mockResolvedValue({
        id: 'payment-123',
        orderId: 'order-123',
        status: 'PAID', // Já está pago
        providerRef: 'test-checkout-id',
      });
      
      const req = createMockRequest(body, signature);
      const response = await POST(req);
      
      expect(response.status).toBe(200);
      expect(prisma.$transaction).not.toHaveBeenCalled();
    });

    it('deve processar evento payment.failed corretamente', async () => {
      const payload = { 
        event: 'payment.failed', 
        data: { checkoutId: 'test-checkout-id', status: 'failed', error: 'Insufficient funds' } 
      };
      const { body, signature } = createSignedPayload(payload);
      
      prisma.payment.findFirst.mockResolvedValue({
        id: 'payment-123',
        orderId: 'order-123',
        status: 'PENDING',
        providerRef: 'test-checkout-id',
      });
      
      const req = createMockRequest(body, signature);
      const response = await POST(req);
      
      expect(response.status).toBe(200);
      expect(prisma.payment.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: 'FAILED',
            errorMessage: 'Insufficient funds',
          }),
        })
      );
    });

    it('deve retornar 200 mesmo se pagamento não for encontrado', async () => {
      const payload = { 
        event: 'checkout.paid', 
        data: { checkoutId: 'non-existent-checkout', status: 'paid' } 
      };
      const { body, signature } = createSignedPayload(payload);
      
      prisma.payment.findFirst.mockResolvedValue(null);
      
      const req = createMockRequest(body, signature);
      const response = await POST(req);
      
      expect(response.status).toBe(200);
      const json = await response.json();
      expect(json.ok).toBe(true);
    });
  });
});
