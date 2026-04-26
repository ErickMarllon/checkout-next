// ==== API Request Types ====

export type Address = {
  street: string;
  streetNumber: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  country?: string;
};

export type Document = {
  type: "cpf" | "cnpj";
  number: string;
};

export type SubMerchant = {
  id: string;
  mcc: string;
  legalName: string;

  document: Document;
  address: Address;

  phone: string; // 21979704490
  url: string; // https://...
};
export interface PagloopCheckoutRequest {
  amount: number; // Valor em centavos
  currency: string;
  paymentMethod: string;
  pix: {
    expiresInDays: number;
  };
  items: PagloopItem[];
  shipping?: {
    fee?: number;
    address?: Address;
  };
  customer: {
    name: string;
    email: string;
    phone?: string;
    document: Document;
  };
  subMerchant?: SubMerchant;
  metadata?: string;
  postbackUrl?: string;
  returnUrl?: string;
  expiresIn?: number; // Segundos
}

export interface PagloopItem {
  title: string;
  unitPrice: number; // Valor em centavos
  quantity: number;
  tangible?: boolean;
  externalRef?: string;
}

// ==== API Response Types ====

export interface PagloopCheckoutResponse {
  id: number;
  tenantId: string;
  paidAt?: string | null;
  refundedAt?: string | null;
  redirectUrl?: string | null;
  returnUrl?: string | null;
  payer?: string | null;
  amount: number; // centavos
  currency: string;

  paidAmount: number;
  refundedAmount: number;

  companyId: number;
  installments: number;

  paymentMethod: "credit_card" | "pix" | "boleto" | string;
  status: "pending" | "paid" | "refunded" | "refused" | string;

  postbackUrl?: string;

  metadata?: string; // pode vir JSON stringificado

  traceable: boolean;

  secureId?: string;
  secureUrl?: string;

  createdAt: string;
  updatedAt: string;

  ip?: string | null;
  externalRef?: string | null;

  authorizationCode?: string | null;

  basePrice?: string | null;
  interestRate?: string | null;

  customer?: PagloopCustomer & {
    address?: PagloopAddress;
  };
  fee: {
    netAmount: number;
    estimatedFee: number;
    fixedAmount: number;
    spreadPercent: number;
    currency: string;
  };
  shipping?: PagloopShipping;

  pix?: PagloopPix;

  boleto?: string | null;
  card?: string | null;

  refusedReason?: string | null;

  items?: PagloopItem[];

  splits?: unknown[];
  refunds?: unknown[];

  delivery?: PagloopDelivery;

  threeDS?: PagloopThreeDS;
}

export type PagloopDelivery = {
  status?: string;
  trackingCode?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type PagloopThreeDS = {
  returnUrl?: string | null;
  redirectUrl?: string | null;
  token?: string | null;
};

export type PagloopCustomer = {
  id: number;
  externalRef?: string | null;
  name: string;
  email: string;
  phone: string;
  birthdate?: string | null;
  createdAt?: string;
  document: Document;
};

export type PagloopShipping = {
  fee?: number;
  address?: PagloopAddress;
};

export type PagloopAddress = {
  street?: string;
  streetNumber?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string | null;
  complement?: string | null;
};

export type PagloopPix = {
  qrcode?: string;
  expirationDate?: string;
  end2EndId?: string | null;
  endToEndId?: string | null;
  receiptUrl?: string | null;
};

export interface PagloopPayment {
  id: string;
  checkoutId: string;
  status: "pending" | "paid" | "failed" | "cancelled";
  amount: number;
  method: "pix" | "credit_card" | "boleto";
  paidAt?: string;
  metadata?: Record<string, string | number | boolean>;
}

// ==== Webhook Types ====

export interface PagloopWebhookEventData {
  checkoutId: string;
  paymentId?: string;
  status: string;
  amount: number;
  method?: string;
  metadata?: Record<string, string | number | boolean>;
}

export interface PagloopWebhookEvent {
  id: string;
  type: "checkout.paid" | "payment.confirmed" | "payment.failed";
  data: PagloopWebhookEventData;
  timestamp: string;
}

export interface PagloopWebhookPayload {
  event: PagloopWebhookEvent;
  signature: string;
}
