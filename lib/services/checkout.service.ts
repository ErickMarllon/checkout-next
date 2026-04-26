import { pagloopGateway } from "../gateways/pagloop";
import { PaymentInput } from "../gateways/types";

export async function createCheckoutWithFallback(input: PaymentInput) {
  try {
    const result = await pagloopGateway.createCheckout(input);
    return result;
  } catch (err) {
    console.error("🔴 PagLoop checkout creation failed:", err);
    throw err;
  }
}

export async function findCheckoutWithFallback(input: string) {
  try {
    const result = await pagloopGateway.findCheckout(input);
    return result;
  } catch (err) {
    console.error("🔴 PagLoop checkout creation failed:", err);
    throw err;
  }
}
