import { PagloopCheckoutResponse } from "@/types/pagloop";
import { executeWithRetry, PaymentGatewayClient } from "./services/retry.service";

const PAGLOOP_BASE_URL = process.env.PAGLOOP_BASE_URL || "https://api.pagloop.com/v1";

// Client com retry automático
const pagloopClient = new PaymentGatewayClient(
  PAGLOOP_BASE_URL,
  process.env.PAGLOOP_API_KEY || "",
  {
    maxRetries: 3,
    initialDelay: 1000,
    maxDelay: 30000,
    backoffMultiplier: 2,
  }
);

export async function pagloopFetch(
  options?: RequestInit,
): Promise<PagloopCheckoutResponse> {
  const authorization =
    "Basic " +
    Buffer.from(
      process.env.PAGLOOP_PUBLIC_KEY + ":" + process.env.PAGLOOP_SECRET_KEY,
    ).toString("base64");

  // Usar retry para chamadas à API externa
  const result = await executeWithRetry<PagloopCheckoutResponse>(
    async () => {
      const url = `${PAGLOOP_BASE_URL}/transactions`;
      
      const res = await fetch(url, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          authorization,
          ...(options?.headers || {}),
        },
        ...options,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          `PagLoop error (${res.status}): ${data.message || data.error || JSON.stringify(data)}`
        );
      }

      return data;
    },
    {
      maxRetries: 3,
      initialDelay: 1000,
      maxDelay: 30000,
      backoffMultiplier: 2,
    }
  );

  if (!result.success || !result.data) {
    throw result.error || new Error("PagLoop request failed after all retries");
  }

  return result.data;
}

export async function pagloopGet(
  transaction: string,
): Promise<PagloopCheckoutResponse> {
  // Usar client com retry automático
  return pagloopClient.get<PagloopCheckoutResponse>(`/transactions/${transaction}`);
}
