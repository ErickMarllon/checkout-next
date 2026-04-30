import { NextRequest, NextResponse } from "next/server";

export interface RateLimitConfig {
  interval: number; // milliseconds
  maxRequests: number;
}

// Store for rate limiting (in production, use Redis or similar)
const ipStore = new Map<string, { count: number; resetTime: number }>();

/**
 * Middleware de rate limiting para API routes
 * @param config - Configuração de rate limiting
 * @returns Middleware function
 */
export function createRateLimiter(config: RateLimitConfig) {
  return async function rateLimitMiddleware(
    req: NextRequest,
    next: () => Promise<NextResponse>,
  ): Promise<NextResponse> {
    const ip = req.headers.get("x-forwarded-for") || 
               req.headers.get("x-real-ip") || 
               "unknown";
    
    const now = Date.now();
    const record = ipStore.get(ip);

    // Limpar registros expirados periodicamente
    if (now % 1000 < 100) {
      for (const [key, value] of ipStore.entries()) {
        if (value.resetTime < now) {
          ipStore.delete(key);
        }
      }
    }

    if (!record || now > record.resetTime) {
      // Novo intervalo
      ipStore.set(ip, {
        count: 1,
        resetTime: now + config.interval,
      });
      return next();
    }

    if (record.count >= config.maxRequests) {
      const retryAfter = Math.ceil((record.resetTime - now) / 1000);
      return NextResponse.json(
        { error: "Too many requests", retryAfter },
        { 
          status: 429,
          headers: {
            "Retry-After": retryAfter.toString(),
            "X-RateLimit-Limit": config.maxRequests.toString(),
            "X-RateLimit-Remaining": "0",
          }
        }
      );
    }

    // Incrementar contador
    record.count++;
    ipStore.set(ip, record);

    return next();
  };
}

/**
 * Rate limiter específico para webhooks (mais permissivo)
 */
export const webhookRateLimiter = createRateLimiter({
  interval: 60000, // 1 minuto
  maxRequests: 100,
});

/**
 * Rate limiter para checkout (mais restritivo)
 */
export const checkoutRateLimiter = createRateLimiter({
  interval: 60000, // 1 minuto
  maxRequests: 10,
});

/**
 * Rate limiter genérico para APIs
 */
export const apiRateLimiter = createRateLimiter({
  interval: 60000, // 1 minuto
  maxRequests: 30,
});
