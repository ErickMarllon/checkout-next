"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useFormContext } from "react-hook-form";
import { CheckoutFormData } from "../schemas/checkout";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { CheckIcon } from "@/assets/svgs/checkIcon";
import { useFieldValidation } from "@/hooks/useFieldValidation";
import { formatBRPhone } from "@/utils/formatBRPhone";

interface Props {
  active: boolean;
  step: number;
  onContinue: () => void;
  onBack: () => void;
}

export const IdentificationStep = ({ active, onContinue }: Props) => {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
    trigger,
  } = useFormContext<CheckoutFormData>();
  const { checkIsValidField } = useFieldValidation<CheckoutFormData>();

  const type = watch("identification.type");

  const handleContinue = async () => {
    const isValid = await trigger("identification");

    if (!isValid) return;

    onContinue();
  };

  return (
    <section
      className={cn(
        "bg-card lg:rounded-lg sm:border border-border p-5 sm:p-6 transition-opacity",
        !active && "opacity-60 pointer-events-none",
        !active && "hidden",
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
            1
          </span>
          <h2 className="text-lg font-bold uppercase text-foreground">
            Identificação
          </h2>
        </div>
        <span className="text-xs font-semibold text-black">1 DE 3</span>
      </div>

      <p className="text-xs text-[#6B7280] font-semibold mb-5">
        Preencha seus dados para envio do pedido.
      </p>

      <div className="space-y-4">
        <div className="space-y-1.5">
          <Field className="relative">
            <FieldLabel>
              {type === "cnpj" ? "Razão social" : "Nome completo"}
            </FieldLabel>

            <span className="relative">
              <input
                placeholder={
                  type === "cnpj" ? "Razão social" : "Digite seu nome completo"
                }
                {...register("identification.name")}
                className={cn(
                  "h-11",
                  errors.identification?.name?.message ? "error" : "",
                )}
              />
              {checkIsValidField("identification.name") && (
                <CheckIcon className="size-5 absolute right-3 top-1/2 -translate-y-1/2 text-green-500" />
              )}
            </span>

            <FieldError
              errors={[{ message: errors.identification?.name?.message }]}
            />
          </Field>
        </div>

        <div className="space-y-1.5">
          <Field>
            <FieldLabel>E-mail</FieldLabel>
            <span className="relative">
              <input
                type="email"
                placeholder="Digite seu e-mail"
                {...register("identification.email")}
                className={cn(
                  "h-11",
                  errors.identification?.email?.message ? "error" : "",
                )}
              />
              {checkIsValidField("identification.email") && (
                <CheckIcon className="size-5 absolute right-3 top-1/2 -translate-y-1/2 text-green-500" />
              )}
            </span>
            <FieldError
              errors={[{ message: errors.identification?.email?.message }]}
            />
          </Field>
        </div>

        <div className="space-y-1.5">
          <Field>
            <FieldLabel>Celular/Whatsapp</FieldLabel>

            <div className="relative">
              <span className="flex absolute mt-px top-1/2 -translate-y-1/2 items-center px-3 text-sm text-muted-foreground">
                +55
              </span>
              <input
                placeholder="(00) 00000-0000"
                maxLength={16}
                {...register("identification.phone", {
                  onChange: (e) => {
                    const formatted = formatBRPhone(e.target.value);
                    setValue("identification.phone", formatted);
                  },
                })}
                className={cn(
                  "flex-1 px-3 text-sm outline-none w-full indent-8",
                  errors.identification?.phone?.message ? "error" : "",
                )}
              />
              {checkIsValidField("identification.phone") && (
                <CheckIcon className="size-5 absolute right-3 top-1/2 -translate-y-1/2 text-green-500" />
              )}
            </div>
            <FieldError
              errors={[{ message: errors.identification?.phone?.message }]}
            />
          </Field>
        </div>

        <Button
          type="button"
          onClick={handleContinue}
          className="w-full h-12 text-base font-bold mt-2"
        >
          Continuar
        </Button>
      </div>
    </section>
  );
};
