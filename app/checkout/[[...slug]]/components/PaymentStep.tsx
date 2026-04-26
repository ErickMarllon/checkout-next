"use client";

import { useEffect, useMemo, useState } from "react";
import { Info, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useFormContext } from "react-hook-form";
import { CheckoutFormData } from "../schemas/checkout";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import {
  isValidCPF,
  isValidCNPJ,
  formatCNPJ,
  formatCPF,
} from "cnpj-cpf-validator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useCartTotals } from "@/hooks/useCartTotals";
import valid from "card-validator";
import creditCardType from "credit-card-type";
import Image from "next/image";

type SafeCardValidatorKey =
  | "number"
  | "cvv"
  | "expirationDate"
  | "expirationMonth"
  | "expirationYear"
  | "postalCode";

interface Props {
  active: boolean;
  isLoading?: boolean;
  step: number;
}
const brandIcons: Record<string, string> = {
  visa: "https://img.icons8.com/color/48/visa.png",
  mastercard: "https://img.icons8.com/color/48/mastercard.png",
  elo: "https://img.icons8.com/color/48/bank-card-back-side.png",
  amex: "https://img.icons8.com/color/48/amex.png",
};

export const PaymentStep = ({ active, step, isLoading }: Props) => {
  const [method, setMethod] = useState<"pix" | "credit_card">("pix");
  const [open, setOpen] = useState(false);

  const {
    register,
    setValue,
    setError,
    clearErrors,
    formState: { isSubmitting, isValid, errors },
    watch,
  } = useFormContext<CheckoutFormData>();
  console.log("🚀 ~ PaymentStep ~ watch:", watch());
  console.log("🚀 ~ PaymentStep ~ isSubmitting:", isSubmitting);
  console.log("🚀 ~ PaymentStep ~ isValid:", isValid);
  console.log("🚀 ~ PaymentStep ~ errors:", errors);
  console.log("🚀 ~ PaymentStep ~ isLoading:", isLoading);

  const type = watch("identification.type");
  const items = watch("items") ?? [];
  const fee = watch("shipping.fee") ?? 0;
  const { totalWithFee } = useCartTotals(items, fee);

  const renderSubmitButton = () => {
    return (
      <Button
        type="submit"
        // disabled={isSubmitting || !isValid || isLoading}
        variant={"default"}
        className="w-full h-12 text-base font-bold mt-2"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-5 w-5 mr-2 animate-spin" /> Processando...
          </>
        ) : (
          "Finalizar Compra"
        )}
      </Button>
    );
  };

  const getCardData = (value: string, key: SafeCardValidatorKey = "number") => {
    const cleaned = value.replace(/\s/g, "");

    const validation = valid[key](cleaned);
    const card = creditCardType(cleaned)[0];

    return {
      ...validation,
      brand: card?.type,
    };
  };

  const cardNumber = watch("payment.card.number") ?? "";

  const cardData = getCardData(cardNumber || "");

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, "");

    const card = creditCardType(cleaned)[0];

    if (!card) {
      // fallback padrão 4-4-4-4
      return cleaned.slice(0, 16).replace(/(\d{4})(?=\d)/g, "$1 ");
    }

    const { gaps, lengths } = card;

    const maxLength = Math.max(...lengths);
    const trimmed = cleaned.slice(0, maxLength);

    let result = "";
    let lastIndex = 0;

    gaps.forEach((gap) => {
      result += trimmed.slice(lastIndex, gap) + " ";
      lastIndex = gap;
    });

    result += trimmed.slice(lastIndex);

    return result.trim();
  };

  function getInstallmentsOptions(total: number, max = 12) {
    return Array.from({ length: max }, (_, i) => {
      const installments = i + 1;
      const value = total / installments;

      return {
        value: String(installments),
        label: `${installments}x de R$ ${(value / 100).toLocaleString("pt-BR", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })} sem juros`,
      };
    });
  }
  const sessionId = useMemo(() => crypto.randomUUID(), []);

  useEffect(() => {
    if (method === "credit_card") {
      setValue("payment.installments", "1");
      setValue("payment.card.sessionId", sessionId);
    }
  }, [method, setValue, sessionId]);

  return (
    <section
      className={cn(
        "bg-card lg:rounded-lg sm:border border-border p-2 sm:p-6 transition-opacity",
        !active && "opacity-60 pointer-events-none",
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
            3
          </span>
          <h2 className="text-lg font-bold uppercase text-foreground">
            Pagamento
          </h2>
        </div>
        <span className="text-xs font-semibold text-black">3 de 3</span>
      </div>

      <p
        className={cn(
          "text-xs mt-1.5",
          step === 3 ? "mb-5" : "font-semibold text-muted-foreground",
        )}
      >
        {" "}
        Todas as transações são seguras e criptografadas.
      </p>

      {active && (
        <div className="space-y-3">
          <div
            onClick={() => {
              setMethod("pix");
              setValue("payment.paymentMethod", "pix");
              clearErrors("payment");
            }}
            className={cn(
              "relative items-center justify-between py-4 transition-all",
            )}
          >
            <div
              className={cn(
                "flex flex-col relative border p-3  w-full bg-[#F8F8F8] rounded-[0.5rem]",
                method === "pix" && "border-blue-500",
              )}
            >
              <div className="flex items-center gap-3 w-full ">
                <div
                  className={`h-5 w-5 rounded-full border flex items-center justify-center
                  ${method === "pix" ? "border-blue-500" : "border-gray-300"}
                `}
                >
                  {method === "pix" && (
                    <div className="h-2.5 w-2.5 rounded-full bg-blue-500" />
                  )}
                </div>

                <svg
                  className="size-5"
                  viewBox="0 0 512 512"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <defs></defs>
                  <g fill="#4BB8A9" fillRule="evenodd">
                    <path d="M112.57 391.19c20.056 0 38.928-7.808 53.12-22l76.693-76.692c5.385-5.404 14.765-5.384 20.15 0l76.989 76.989c14.191 14.172 33.045 21.98 53.12 21.98h15.098l-97.138 97.139c-30.326 30.344-79.505 30.344-109.85 0l-97.415-97.416h9.232zm280.068-271.294c-20.056 0-38.929 7.809-53.12 22l-76.97 76.99c-5.551 5.53-14.6 5.568-20.15-.02l-76.711-76.693c-14.192-14.191-33.046-21.999-53.12-21.999h-9.234l97.416-97.416c30.344-30.344 79.523-30.344 109.867 0l97.138 97.138h-15.116z"></path>
                    <path d="M22.758 200.753l58.024-58.024h31.787c13.84 0 27.384 5.605 37.172 15.394l76.694 76.693c7.178 7.179 16.596 10.768 26.033 10.768 9.417 0 18.854-3.59 26.014-10.75l76.989-76.99c9.787-9.787 23.331-15.393 37.171-15.393h37.654l58.3 58.302c30.343 30.344 30.343 79.523 0 109.867l-58.3 58.303H392.64c-13.84 0-27.384-5.605-37.171-15.394l-76.97-76.99c-13.914-13.894-38.172-13.894-52.066.02l-76.694 76.674c-9.788 9.788-23.332 15.413-37.172 15.413H80.782L22.758 310.62c-30.344-30.345-30.344-79.524 0-109.868"></path>
                  </g>
                </svg>

                <div className="grid text-left">
                  <span className="font-bold text-foreground">PIX</span>
                  <span className="text-[rgb(21,128,61)] text-xs font-medium mt-1">
                    Aprovação imediata
                  </span>
                </div>
              </div>

              {method === "pix" && (
                <div className="space-y-4 pt-4 w-full">
                  <p className="text-gray-500 font-regular text-sm">
                    O código Pix expira em 30 minutos após finalizar a compra.
                  </p>
                  <div className="space-y-1.5">
                    <Field>
                      <FieldLabel className="text-xs font-semibold">
                        <>
                          {type === "cnpj" ? "CNPJ" : "CPF"}
                          <Tooltip open={open}>
                            <TooltipTrigger
                              asChild
                              onTouchStart={() => setOpen(true)}
                              onMouseEnter={() => setOpen(true)}
                              onMouseLeave={() => setOpen(false)}
                            >
                              <Info className="h-4 w-4" />
                            </TooltipTrigger>

                            <TooltipContent
                              side="top"
                              align="start"
                              avoidCollisions={false}
                              alignOffset={-36}
                              onPointerDownOutside={() => setOpen(false)}
                              className="max-w-67.5 bg-[rgb(19,191,140)] border-green-600/30 [&_svg]:fill-[rgb(19,191,140)] [&_svg]:bg-[rgb(19,191,140)]"
                            >
                              <p>
                                <b>Por que solicitamos o CPF?</b> Para emissão
                                da nota fiscal e segurança da compra.
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </>
                      </FieldLabel>

                      <input
                        placeholder={
                          type === "cnpj"
                            ? "00.000.000/0000-00"
                            : "000.000.000-00"
                        }
                        maxLength={type === "cnpj" ? 14 : 14}
                        className="h-11"
                        {...register("payment.document", {
                          onBlur: (e) => {
                            const value = e.target.value.replace(/\D/g, "");

                            let isValid = true;
                            let message = "";

                            if (type === "cpf") {
                              isValid = isValidCPF(value);
                              message = "CPF inválido";
                            }

                            if (type === "cnpj") {
                              isValid = isValidCNPJ(value);
                              message = "CNPJ inválido";
                            }

                            if (!isValid) {
                              setError("payment.document", {
                                type: "manual",
                                message,
                              });
                              return;
                            }

                            clearErrors("payment.document");

                            if (type === "cpf") {
                              setValue("payment.document", formatCPF(value));
                            }

                            if (type === "cnpj") {
                              setValue("payment.document", formatCNPJ(value));
                            }
                          },
                        })}
                      />

                      <FieldError
                        errors={[
                          { message: errors.payment?.document?.message },
                        ]}
                      />
                    </Field>
                  </div>
                  {renderSubmitButton()}
                </div>
              )}
            </div>
          </div>

          <div
            onClick={() => {
              setMethod("credit_card");
              setValue("payment.paymentMethod", "credit_card");
            }}
            className={cn(
              "relative items-center justify-between py-4 transition-all",
            )}
          >
            <div
              className={cn(
                "flex flex-col relative border p-3  w-full bg-[#F8F8F8] rounded-[0.5rem]",
                method === "credit_card" && "border-blue-500",
              )}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`h-5 w-5 rounded-full border flex items-center justify-center
                  ${method === "credit_card" ? "border-blue-500" : "border-gray-300"}
                `}
                >
                  {method === "credit_card" && (
                    <div className="h-2.5 w-2.5 rounded-full bg-blue-500" />
                  )}
                </div>
                <svg
                  className="size-5"
                  width="18"
                  height="18"
                  viewBox="0 0 20 20"
                  fill="none"
                >
                  <path
                    d="M2.5 7.5026H17.5"
                    stroke="#374151"
                    strokeWidth="1.5"
                  ></path>
                  <path
                    d="M7.97492 10.8346H5.83325"
                    stroke="#374151"
                    strokeWidth="1.5"
                  ></path>
                  <path
                    d="M15 15.8346H5C3.61917 15.8346 2.5 14.7155 2.5 13.3346V6.66797C2.5 5.28714 3.61917 4.16797 5 4.16797H15C16.3808 4.16797 17.5 5.28714 17.5 6.66797V13.3346C17.5 14.7155 16.3808 15.8346 15 15.8346Z"
                    stroke="#374151"
                    strokeWidth="1.5"
                  ></path>
                </svg>
                <div className="font-bold text-foreground">
                  Cartão de crédito
                </div>
              </div>

              {method === "credit_card" && (
                <div className="space-y-4 pt-4  mt-4">
                  <div className="space-y-1.5">
                    <Field>
                      <FieldLabel className="text-xs font-semibold">
                        Número do cartão
                      </FieldLabel>

                      <div className="relative">
                        <input
                          id="cardnum"
                          placeholder="0000 0000 0000 0000"
                          className="h-11"
                          inputMode="numeric"
                          {...register("payment.card.number", {
                            onChange: (e) => {
                              const raw = e.target.value;

                              const formatted = formatCardNumber(raw);

                              setValue("payment.card.number", formatted, {
                                shouldValidate: true,
                              });

                              const { isValid, isPotentiallyValid } =
                                getCardData(formatted);

                              if (!isPotentiallyValid) {
                                setError("payment.card.number", {
                                  type: "manual",
                                  message: "Número inválido",
                                });
                                return;
                              }

                              if (isValid) {
                                clearErrors("payment.card.number");
                              }
                            },
                          })}
                        />
                        {cardData.isValid && cardData.brand && (
                          <Image
                            alt={cardData.brand}
                            width={24}
                            height={16}
                            src={brandIcons[cardData.brand]}
                            className="absolute right-3 top-1/2 -translate-y-1/2 h-6"
                          />
                        )}
                      </div>
                      <FieldError
                        errors={[
                          { message: errors.payment?.card?.number?.message },
                        ]}
                      />
                    </Field>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Field>
                        <FieldLabel className="text-xs font-semibold">
                          Validade
                        </FieldLabel>
                        <input
                          placeholder="MM/AA"
                          inputMode="numeric"
                          className="h-11"
                          {...register("payment.card.expirationDate", {
                            onChange: (e) => {
                              let value = e.target.value.replace(/\D/g, "");

                              if (value.length > 4) value = value.slice(0, 4);

                              if (value.length >= 3) {
                                value = value.replace(/(\d{2})(\d+)/, "$1/$2");
                              }

                              setValue("payment.card.expirationDate", value, {
                                shouldDirty: true,
                              });

                              if (value.length !== 5) return;

                              const result = getCardData(
                                value,
                                "expirationDate",
                              );

                              if (!result.isPotentiallyValid) {
                                setError("payment.card.expirationDate", {
                                  type: "manual",
                                  message: "Data inválida",
                                });
                                return;
                              }

                              if (!result.isValid) {
                                setError("payment.card.expirationDate", {
                                  type: "manual",
                                  message: "Cartão expirado",
                                });
                                return;
                              }

                              clearErrors("payment.card.expirationDate");

                              const [month, year] = value.split("/");
                              setValue(
                                "payment.card.expirationMonth",
                                Number(month),
                                { shouldDirty: true },
                              );

                              setValue(
                                "payment.card.expirationYear",
                                2000 + Number(year),
                                { shouldDirty: true },
                              );
                            },
                          })}
                        />
                        <FieldError
                          errors={[
                            {
                              message:
                                errors.payment?.card?.expirationMonth
                                  ?.message ||
                                errors.payment?.card?.expirationYear?.message ||
                                errors.payment?.card?.expirationDate?.message,
                            },
                          ]}
                        />
                      </Field>
                    </div>
                    <div className="space-y-1.5">
                      <Field>
                        <FieldLabel className="text-xs font-semibold">
                          CVV
                        </FieldLabel>
                        <input
                          placeholder="000"
                          className="h-11"
                          maxLength={4}
                          {...register("payment.card.cvv", {
                            onChange: (e) => {
                              const value = e.target.value.replace(/\D/g, "");

                              const result = getCardData(value, "cvv");

                              if (!result.isPotentiallyValid) {
                                setError("payment.card.cvv", {
                                  type: "manual",
                                  message: "CVV inválido",
                                });
                                return;
                              }

                              if (result.isValid) {
                                clearErrors("payment.card.cvv");
                              }
                            },
                          })}
                        />
                        <FieldError
                          errors={[
                            {
                              message: errors.payment?.card?.cvv?.message,
                            },
                          ]}
                        />
                      </Field>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Field>
                      <FieldLabel className="text-xs font-semibold">
                        Nome no cartão
                      </FieldLabel>
                      <input
                        {...register("payment.card.holderName")}
                        placeholder="Como impresso no cartão"
                        className="h-11"
                      />
                    </Field>
                  </div>

                  <div className="space-y-1.5">
                    <Field>
                      <FieldLabel className="text-xs font-semibold">
                        CPF do titular do cartão
                      </FieldLabel>
                      <input
                        maxLength={14}
                        {...register("payment.document", {
                          onBlur: (e) => {
                            const value = e.target.value.replace(/\D/g, "");

                            let isValid = true;
                            let message = "";

                            if (type === "cpf") {
                              isValid = isValidCPF(value);
                              message = "CPF inválido";
                            }

                            if (!isValid) {
                              setError("payment.document", {
                                type: "manual",
                                message,
                              });
                              return;
                            }

                            clearErrors("payment.document");

                            if (type === "cpf") {
                              setValue("payment.document", formatCPF(value));
                            }
                          },
                        })}
                        placeholder="CPF do titular do cartão"
                        className="h-11"
                      />
                      <FieldError
                        errors={[
                          { message: errors.payment?.document?.message },
                        ]}
                      />
                    </Field>
                  </div>

                  <div className="space-y-1.5">
                    <Field>
                      <FieldLabel className="text-xs font-semibold">
                        Parcelas
                      </FieldLabel>
                      {/* <Input
                    {...register("payment.installments")}
                    placeholder="Selecione o número de parcelas"
                    className="h-11"
                  /> */}
                      <select
                        {...register("payment.installments")}
                        className="h-11 w-full rounded-md border px-3 text-base"
                      >
                        <option value="">Selecione as parcelas</option>

                        {getInstallmentsOptions(totalWithFee).map((opt) => (
                          <option
                            key={opt.value}
                            value={opt.value}
                            className="text-base"
                          >
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </Field>
                  </div>

                  {renderSubmitButton()}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
