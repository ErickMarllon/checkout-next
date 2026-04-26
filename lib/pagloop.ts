import { PagloopCheckoutResponse } from "@/types/pagloop";

export async function pagloopFetch(
  options?: RequestInit,
): Promise<PagloopCheckoutResponse> {
  const url = `https://api.pagloop.com/v1/transactions`;

  const authorization =
    "Basic " +
    Buffer.from(
      process.env.PAGLOOP_PUBLIC_KEY + ":" + process.env.PAGLOOP_SECRET_KEY,
    ).toString("base64");

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
    console.error(`❌ Pagloop API error:`, data.error.shipping.address);
    throw new Error(
      `PagLoop error (${res.status}): ${data.message || data.error || JSON.stringify(data)}`,
    );
  }

  return data;
}
export async function pagloopGet(
  transaction: string,
): Promise<PagloopCheckoutResponse> {
  const url = `https://api.pagloop.com/v1/transactions/${transaction}`;

  const authorization =
    "Basic " +
    Buffer.from(
      process.env.PAGLOOP_PUBLIC_KEY + ":" + process.env.PAGLOOP_SECRET_KEY,
    ).toString("base64");

  const res = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      authorization,
    },
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(
      `PagLoop error (${res.status}): ${data.message || data.error || JSON.stringify(data)}`,
    );
  }

  return data;
}
