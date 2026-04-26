import { Lock } from "lucide-react";
import { PaymentBadge } from "./PaymentBadge";
import { getTenantConfig } from "@/utils/getTenantConfig";
import { getHost } from "@/utils/getHost";
import { use } from "react";

export type PaymentMethod = {
  label: string;
  className?: string; // opcional
};
export type SecurityIcon = "lock" | "shield" | "check";
export type TenantConfig = {
  brand: {
    name: string;
    segment: string;
    copyright: string;
  };

  company: {
    legalName: string;
    cnpj: string;
    year: number;
  };

  address: {
    street: string;
    district: string;
    zipCode: string;
    city: string;
    state: string;
    country: string;
  };

  contact: {
    whatsapp: string;
    phone: string;
    email: string;
  };

  payments: PaymentMethod[];

  security: {
    title: string;
    subtitle: string;
    icon: SecurityIcon;
  };
};

export const CheckoutFooter = () => {
  const host = use(getHost());
  const footerData = getTenantConfig(host);

  if (!footerData) return null;

  return (
    <footer className="bg-muted/40 border-t border-border mt-12">
      <div className="max-w-7xl mx-auto px-4 py-8 text-center text-xs sm:text-sm text-muted-foreground space-y-2">
        <p className="font-semibold text-foreground">
          {footerData.brand.name} | {footerData.brand.segment} |{" "}
          {footerData.brand.copyright}
        </p>

        <p>
          {footerData.address.street} - {footerData.address.district} - CEP{" "}
          {footerData.address.zipCode} - {footerData.address.city}/
          {footerData.address.state}
        </p>

        <p>
          © {footerData.company.year} {footerData.company.legalName} | CNPJ:{" "}
          {footerData.company.cnpj}
        </p>

        <p>
          Whatsapp: {footerData.contact.whatsapp} / Telefone:{" "}
          {footerData.contact.phone} / E-mail: {footerData.contact.email}
        </p>

        <div className="pt-4">
          <p className="font-semibold text-foreground mb-3">
            Formas de pagamento:
          </p>

          <div className="flex flex-wrap justify-center gap-2">
            {footerData.payments.map(
              (p: { label: string; className: string }) => (
                <PaymentBadge
                  key={p.label}
                  label={p.label}
                  className={p.className}
                />
              ),
            )}
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 pt-6">
          <Lock className="h-4 w-4" />
          <div className="leading-tight text-left">
            <div className="text-xs font-bold text-foreground">
              {footerData.security.title}
            </div>
            <div className="text-[10px]">{footerData.security.subtitle}</div>
          </div>
        </div>
      </div>
    </footer>
  );
};
