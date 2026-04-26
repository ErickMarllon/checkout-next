"use client";

import { use, useEffect, useState } from "react";
import { toast } from "sonner";
import { UrgencyBanner } from "./components/UrgencyBanner";
import { IdentificationStep } from "./components/IdentificationStep";
import { ShippingStep } from "./components/ShippingStep";
import { PaymentStep } from "./components/PaymentStep";
import { OrderSummary } from "./components/OrderSummary";
import { CheckoutFormData, checkoutSchema } from "./schemas/checkout";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { CHECKOUT_DEFAULT_VALUES } from "./constants/formValues";
import { useCartTotals } from "@/hooks/useCartTotals";
import { useRouter } from "next/navigation";
import { CheckoutBanner } from "./components/CheckoutBanner";
import { CheckoutLoading } from "./components/CheckoutLoading";
import { CheckoutStepper } from "./components/CheckoutStepper";
import { zodResolver } from "@hookform/resolvers/zod";
import { ProductFormData } from "./schemas/items";
import { cn } from "@/lib/utils";
import { Steps } from "./components/Steps";

export interface CreateCheckoutProps {
  success: boolean;
  orderId: string;
  paymentId: string;
  pix: {
    qrcode?: string;
    qrImage?: string;
    expirationDate?: string;
  };
}

export default function Checkout(props: {
  params: Promise<{ slug?: string }>;
}) {
  const params = use(props.params);
  const router = useRouter();
  const [step, setStep] = useState<number>(1);
  console.log("🚀 ~ Checkout ~ step:", step);
  const [isLoading, setIsLoading] = useState(false);
  const [products, setProducts] = useState<ProductFormData[]>([]);

  const form = useForm<CheckoutFormData>({
    defaultValues: CHECKOUT_DEFAULT_VALUES,
    resolver: zodResolver(checkoutSchema),

    mode: "onChange",
  });

  const items =
    useWatch({
      control: form.control,
      name: "items",
    }) ?? [];

  const { totalPrice } = useCartTotals(items);

  const handleSubmit = async (data: CheckoutFormData) => {
    try {
      setIsLoading(true);
      const sanitizedData = {
        ...data,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        items: data.items.map(({ image: _, ...rest }) => rest),
      };

      const body = {
        ...sanitizedData,
        amount: totalPrice,
      };

      const response = await fetch("/api/pagloop/create-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        toast.error("Erro ao processar pagamento", {
          description: "Por favor, utilize outro método de pagamento.",
        });
        return;
      }

      const result: CreateCheckoutProps = await response.json();

      if (result.paymentId) {
        router.push(
          `${process.env.NEXT_PUBLIC_URL}/payment/${result.paymentId}`,
        );
      }
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Erro ao processar pagamento";
      toast.error(msg);
      console.error("❌ Checkout error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const load = async () => {
      const res = await fetch("/api/products");
      const data = await res.json();

      setProducts(data);
    };

    load();
  }, []);

  useEffect(() => {
    if (params.slug?.[0] && products?.length) {
      const itemSelected = products.find((p) => p.id === params.slug?.[0]);

      if (!itemSelected) return;

      form.setValue("items", [
        {
          ...itemSelected,
          image: itemSelected.image as unknown as string,
          quantity: 1,
        },
      ]);
    }
  }, [form, params.slug, products]);

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <UrgencyBanner />
      <CheckoutBanner />
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-0 sm:px-6 pb-6 lg:pb-8">
          <div className="space-y-4">
            <FormProvider {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)}>
                <div className="grid grid-cols-1 lg:py-4 gap-4">
                  <div className="order-2">
                    <CheckoutStepper current={step} />
                  </div>
                  <div className="order-3 grid  lg:grid-cols-3 gap-4  relative space-y-reverse px-2 md:px-3.5 lg:mt-6">
                    <div className={cn("flex flex-col sm:px-0 gap-4")}>
                      <Steps step={step} onBack={setStep} />

                      <IdentificationStep
                        active={step === 1}
                        step={step}
                        onContinue={() => setStep(2)}
                        onBack={() => setStep(1)}
                      />

                      <ShippingStep
                        active={step === 2}
                        step={step}
                        onContinue={() => setStep(3)}
                        onBack={() => setStep(2)}
                      />
                    </div>
                    <div>
                      <PaymentStep
                        active={step === 3}
                        step={step}
                        isLoading={isLoading}
                      />
                    </div>

                    <div className="lg:order-2 flex-1 hidden lg:flex flex-col min-h-0 mx-auto max-w-2xl relative px-0 w-full lg:max-w-296">
                      <OrderSummary />
                    </div>
                  </div>
                  <div className="order-1 flex lg:hidden min-h-0 mx-auto relative px-0 md:px-3.5 lg:px-3 w-full lg:max-w-296">
                    <OrderSummary />
                  </div>
                </div>
              </form>
            </FormProvider>
          </div>
        </div>
      </main>

      <CheckoutLoading open={isLoading} />
    </div>
  );
}
