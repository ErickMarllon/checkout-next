// Jest Setup File

// Mock next/server
jest.mock('next/server', () => ({
  NextRequest: require('next/server').NextRequest || class NextRequest extends Request {},
  NextResponse: {
    json: (data: unknown, init?: ResponseInit) => {
      return new Response(JSON.stringify(data), {
        ...init,
        headers: {
          ...init?.headers,
          'content-type': 'application/json',
        },
      });
    },
  },
}));

// Set default environment variables for tests
process.env.PAGLOOP_WEBHOOK_SECRET = process.env.PAGLOOP_WEBHOOK_SECRET || 'test-webhook-secret';
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://test:test@localhost:5432/test_db';
process.env.NODE_ENV = 'test';

// Increase timeout for integration tests
jest.setTimeout(10000);
