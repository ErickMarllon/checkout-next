"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useFormContext } from "react-hook-form";
import { CheckoutFormData } from "../schemas/checkout";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { ShippingOptions } from "./ShippingOptions";

interface Props {
  active: boolean;
  onContinue: () => void;
  onBack: () => void;
  step: number;
}

export const ShippingStep = ({ active, step, onContinue }: Props) => {
  const [loadingCep, setLoadingCep] = useState(false);
  const [cepError, setCepError] = useState<string | null>(null);
  const [cepSuccess, setCepSuccess] = useState<boolean | null>(false);

  const {
    register,
    watch,
    setValue,
    resetField,
    trigger,
    getValues,
    formState: { errors },
  } = useFormContext<CheckoutFormData>();

  const zipCode = watch("shipping.address.zipCode");

  const lookupCep = async (raw: string) => {
    const cep = raw.replace(/\D/g, "");
    if (cep.length !== 8) return;

    setLoadingCep(true);
    setCepError(null);

    try {
      const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const json = await res.json();

      if (json.erro) {
        setCepError("CEP não encontrado");
        return;
      }

      setValue("shipping.address.street", json.logradouro || "");
      setValue("shipping.address.neighborhood", json.bairro || "");
      setValue("shipping.address.city", json.localidade || "");
      setValue("shipping.address.state", json.uf || "");
      setValue("shipping.address.country", "BR");
      setCepSuccess(true);
    } catch {
      setCepError("Erro ao buscar CEP");
      setCepSuccess(false);
    } finally {
      setLoadingCep(false);
    }
  };

  const handleContinue = async () => {
    const isValid = await trigger("shipping");

    if (!isValid) return;

    onContinue();
  };

  return (
    <section
      className={cn(
        "bg-card lg:rounded-lg sm:border border-border p-5 sm:p-6 transition-opacity",
        !active && "opacity-60 pointer-events-none",
        step > 2 && "hidden",
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span
            className={cn(
              "flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold",
              active
                ? "bg-slate-700 text-gray-50"
                : "bg-[#E5E7EB] text-gray-400",
            )}
          >
            2
          </span>
          <h2 className="text-lg font-bold uppercase text-foreground">
            Entrega
          </h2>
        </div>
        <span className="text-xs text-black">2 de 3</span>
      </div>

      <p
        className={cn(
          "text-xs mt-1.5",
          step === 2 ? "mb-5" : "font-semibold text-muted-foreground",
        )}
      >
        Informe o endereço para envio do pedido.
      </p>

      {step === 2 && (
        <>
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-3">
              <div className="space-y-1.5">
                <Field>
                  <FieldLabel>CEP</FieldLabel>
                  <div className="grid gap-4 grid-cols-[minmax(0,1fr)_1fr] xs:grid-cols-[minmax(0,12.5rem)_1fr]">
                    <div className="relative">
                      <input
                        placeholder="00000-000"
                        value={zipCode || ""}
                        disabled={loadingCep}
                        maxLength={9}
                        onChange={(e) => {
                          const v = e.target.value
                            .replace(/\D/g, "")
                            .slice(0, 8);
                          const formatted =
                            v.length > 5 ? `${v.slice(0, 5)}-${v.slice(5)}` : v;
                          console.log(formatted.length);
                          if (formatted.length === 9) {
                            lookupCep(e.target.value);
                          }
                          setCepSuccess(false);
                          setValue("shipping.address.zipCode", formatted);
                          resetField("shipping.address.street");
                          resetField("shipping.address.neighborhood");
                          resetField("shipping.address.city");
                          resetField("shipping.address.state");
                          resetField("shipping.address.country");
                        }}
                        className="h-11 "
                      />
                    </div>
                    {cepSuccess && (
                      <span className="text-xs text-black flex flex-row items-center gap-1">
                        <span>{getValues("shipping.address.state")}</span>

                        <span className="flex items-center gap-1">
                          <span>/</span>
                          {getValues("shipping.address.city")}
                        </span>
                      </span>
                    )}
                  </div>
                  <FieldError
                    errors={[
                      {
                        message:
                          cepError ??
                          errors.shipping?.address?.zipCode?.message,
                      },
                    ]}
                  />
                </Field>
              </div>
            </div>

            {zipCode && !loadingCep && cepSuccess && (
              <>
                <div className="space-y-1.5">
                  <Field>
                    <FieldLabel>Rua / Logradouro</FieldLabel>
                    <input
                      placeholder="Nome da rua"
                      {...register("shipping.address.street")}
                      className="h-11"
                    />
                    <FieldError
                      errors={[
                        { message: errors.shipping?.address?.street?.message },
                      ]}
                    />
                  </Field>
                </div>
                <FieldGroup className="grid grid-cols-[60px_1fr] gap-4">
                  <div className="space-y-1.5">
                    <Field>
                      <FieldLabel>Número</FieldLabel>
                      <input
                        placeholder="Nº"
                        {...register("shipping.address.streetNumber")}
                        className="h-11"
                      />
                      <FieldError
                        errors={[
                          {
                            message:
                              errors.shipping?.address?.streetNumber?.message,
                          },
                        ]}
                      />
                    </Field>
                  </div>

                  <div className="space-y-1.5">
                    <Field>
                      <FieldLabel>Bairro</FieldLabel>
                      <input
                        placeholder="Bairro"
                        {...register("shipping.address.neighborhood")}
                        className="h-11"
                      />

                      <FieldError
                        errors={[
                          {
                            message:
                              errors.shipping?.address?.neighborhood?.message,
                          },
                        ]}
                      />
                    </Field>
                  </div>
                </FieldGroup>

                <div className="space-y-1.5">
                  <Field>
                    <FieldLabel>Complemento (opcional)</FieldLabel>
                    <input
                      placeholder="Apto, bloco, referência..."
                      {...register("shipping.address.complement")}
                      className="h-11"
                    />
                    <FieldError
                      errors={[
                        {
                          message:
                            errors.shipping?.address?.complement?.message,
                        },
                      ]}
                    />
                  </Field>
                </div>
              </>
            )}
          </div>
          {zipCode && !loadingCep && cepSuccess && (
            <div className="mt-4">
              <ShippingOptions />
            </div>
          )}

          <Button
            type="button"
            onClick={handleContinue}
            className="w-full h-12 text-base font-bold mt-4"
          >
            Ir Para Pagamento
          </Button>
        </>
      )}
    </section>
  );
};
