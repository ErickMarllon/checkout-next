"use client";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import { Minus, Plus, Ticket } from "lucide-react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { CheckoutFormData } from "../schemas/checkout";
import Image from "next/image";
import { useCartTotals } from "@/hooks/useCartTotals";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { formatCurrencyBRL } from "@/utils/formatCurrencyBRL";
import { Separator } from "@/components/ui/separator";

export const OrderSummary = () => {
  const [openCoupon, setOpenCoupon] = useState<boolean>(false);
  const [openAccordion, setOpenAccordion] = useState<string>("shipping");
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);

  const { watch, setValue, control, register } =
    useFormContext<CheckoutFormData>();
  const items = watch("items") ?? [];
  const installment = Number(watch("payment.installments") ?? 12);
  const fee = watch("shipping.fee") ?? 0;
  const { totalWithFee, totalPrice, totalQuantity, totalDiscount } =
    useCartTotals(items, fee);

  const { fields, update } = useFieldArray({
    control,
    name: "items",
  });

  const handleApplyCoupon = () => {
    setIsApplyingCoupon(true);
    setCouponError(null);

    setTimeout(() => {
      setIsApplyingCoupon(false);
      setCouponError("Código de desconto inválido ou expirado.");

      setTimeout(() => {
        setCouponError(null);
      }, 3000);
    }, 1000);
  };

  useEffect(() => {
    if (totalWithFee) {
      setValue("amount", totalWithFee);
    } else {
      setValue("amount", 0);
    }
  }, [totalWithFee, setValue]);

  function getInstallmentsOptions() {
    const value = totalWithFee / installment;
    return `ou ${installment}x de R$ ${formatCurrencyBRL(value)}`;
  }

  return (
    <>
      <Accordion
        type="single"
        collapsible
        defaultValue="shipping"
        className="max-w-full min-h-fit overflow-y-auto border-[#E2E8F0] border lg:rounded-lg"
        value={openAccordion}
        onValueChange={setOpenAccordion}
      >
        <AccordionItem value="shipping" className="gap-2 min-h-fit ">
          <AccordionTrigger className="hover:no-underline p-3.25 pl-4.75 bg-[#f7f7f7]  gap-1">
            <span className="flex w-full items-center">
              <span className="text-[12px] font-medium flex-1 min-w-0 text-[rgb(17, 24, 39)">
                Resumo do pedido
                {!openAccordion && <>({totalQuantity})</>}
              </span>
              <span className="font-semibold text-md text-[rgb(3, 7, 18)]">
                R$ {formatCurrencyBRL(totalPrice)}
              </span>{" "}
            </span>
          </AccordionTrigger>

          <AccordionContent className="min-h-fit max-h-fit transition-all duration-300 px-1">
            <div className="flex-1 flex flex-col min-h-0 min-w-0 transition-opacity duration-300 ease-out opacity-100">
              <div className="mt-5 lg:order-2 flex flex-col">
                {items.map((item) => {
                  if (!item.gift?.image) return;
                  return (
                    <div
                      key={`${item.id} - ${new Date()}`}
                      className="mt-3 mb-4 order-2"
                    >
                      <div className="flex items-center gap-3 border border-dashed mx-3 p-2 rounded-[0.5rem] border-slate-200 bg-emerald-50/60">
                        <Image
                          src={item.gift?.image}
                          alt={item.gift?.title}
                          width={56}
                          height={56}
                          loading="lazy"
                          decoding="async"
                          className="w-12 h-12 rounded-md object-cover shrink-0"
                        />

                        <div className="flex min-w-0 items-center gap-3 w-full ">
                          <span className="flex-1 max-w-[80%] text-[13px] truncate font-semibold text-slate-700">
                            {item.gift.title}
                          </span>
                          <span className="inline-flex items-center rounded-md border border-emerald-300 text-emerald-600 bg-white px-2 py-0.5 text-[11px] font-semibold shrink-0">
                            Brinde
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}

                <span className="hidden lg:block px-4">
                  <Separator />
                </span>

                <ul role="list" className="divide-y divide-slate-200 px-4">
                  {fields.map((item, index) => (
                    <li key={item.id} className="flex items-start gap-3 py-3">
                      <div className="shrink-0 bg-white rounded-lg border border-slate-200 object-cover shadow-sm p-[0.2rem]">
                        {item.image && (
                          <Image
                            src={item.image}
                            alt={item.title}
                            width={48}
                            height={48}
                            loading="lazy"
                            decoding="async"
                            className="w-12 h-12 rounded-lg object-cover shrink-0"
                          />
                        )}
                      </div>
                      <div className="min-w-0 flex-1 flex gap-1">
                        <span className="text-[12px] font-normal text-black min-w-0 wrap-break-word leading-tight block">
                          {item.title}
                        </span>
                        {/* <div className="flex items-start justify-between gap-2 min-h-[1.25rem]">
                          <div className="min-w-0 flex-1 flex flex-col gap-1">
                            <span className="text-[11px] text-slate-500 break-words block">
                              Dourada + Preto [MODELO 1]
                            </span>
                          </div>
                        </div> */}
                      </div>
                      <div className="shrink-0 flex flex-col items-end gap-1">
                        <div className="flex flex-col items-end gap-0.5">
                          <span className="text-[13px] font-normal text-black whitespace-nowrap">
                            R$ {formatCurrencyBRL(item.unitPrice)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="shrink-0 flex items-center">
                            <label className="text-[13px] font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 sr-only">
                              Quantidade
                            </label>
                            <div className="inline-flex items-center h-8 rounded-md border border-slate-200 bg-transparent hover:bg-transparent overflow-hidden">
                              <button
                                type="button"
                                className="flex items-center justify-center w-8 h-full text-slate-600 hover:bg-transparent focus:outline-none shrink-0"
                                aria-label="Diminuir quantidade"
                                onClick={() => {
                                  const current = fields[index].quantity ?? 1;

                                  if (current > 1) {
                                    update(index, {
                                      ...fields[index],
                                      quantity: current - 1,
                                    });
                                  }
                                }}
                              >
                                <Minus className="size-3 text-gray-400" />
                              </button>
                              <input
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                {...register(`items.${index}.quantity`, {
                                  setValueAs: (value) => {
                                    const numeric = Number(value);
                                    return isNaN(numeric) || numeric < 1
                                      ? 1
                                      : numeric;
                                  },
                                })}
                                onInput={(e) => {
                                  e.currentTarget.value =
                                    e.currentTarget.value.replace(/\D/g, "");
                                }}
                                className="w-7 h-full text-center text-[12px] p-0 font-medium text-slate-700 bg-transparent border-none focus:outline-none focus-visible:ring-0"
                              />
                              <button
                                type="button"
                                className="flex items-center justify-center w-8 h-full text-slate-600 hover:bg-transparent focus:outline-none shrink-0"
                                aria-label="Aumentar quantidade"
                                onClick={() => {
                                  const current = fields[index].quantity ?? 1;

                                  update(index, {
                                    ...fields[index],
                                    quantity: current + 1,
                                  });
                                }}
                              >
                                <Plus className="size-3 text-gray-400" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="md:mt-0 my-3 mx-3">
                {openCoupon ? (
                  <div className="mb-6 relative">
                    <div className="flex items-center gap-2 mb-2">
                      <input
                        className="flex border border-[#dedede] max-w-1/2 px-3 py-1 transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-black focus-visible:ring-1 focus-visible:ring-black disabled:cursor-not-allowed disabled:opacity-50 bg-[#E8F0FE] h-10 text-[13px] w-full  font-normal rounded-md"
                        placeholder="Digite um cupom"
                        id="couponCode-mobile"
                        type="text"
                        value=""
                      />

                      <Button
                        type="button"
                        variant={"ghost"}
                        size={"lg"}
                        className="whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-100 px-4 py-2 w-full max-w-25 h-10 flex justify-start items-center font-medium text-[13px] bg-transparent hover:bg-transparent text-black border-0 shadow-none rounded-[0.5rem]"
                        onClick={handleApplyCoupon}
                        disabled={isApplyingCoupon}
                      >
                        {isApplyingCoupon ? "Buscando" : "Aplicar cupom"}
                      </Button>
                    </div>
                    {couponError && (
                      <p className="text-xs absolute -bottom-5 text-red-500">
                        {couponError}
                      </p>
                    )}
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setOpenCoupon((prev) => !prev)}
                    className="flex items-center text-green-600  gap-2 text-success font-medium text-sm mb-4 hover:underline"
                  >
                    <Ticket className="h-4 w-4" />
                    Inserir cupom de desconto
                  </button>
                )}
              </div>

              <dl className="lg:order-1 space-y-1 text-slate-500 p-4 lg:pb-0">
                <div className="flex items-center justify-between mb-0">
                  <dt className="text-[12px] text-black">Produtos (1)</dt>
                  <dd className="text-black text-[12px]">
                    R$ {formatCurrencyBRL(totalPrice)}
                  </dd>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <dt className="text-black text-[12px]">Frete</dt>
                  <dd className="text-[12px] text-green-600 font-normal">
                    {fee > 0 ? `R$ ${formatCurrencyBRL(fee)}` : "Grátis"}
                  </dd>
                </div>
                <div>
                  <Accordion
                    type="single"
                    collapsible
                    defaultValue=""
                    className="w-full "
                  >
                    <AccordionItem value="item-1" className="mt-0">
                      <AccordionTrigger className="py-0">
                        <span className="flex max-w-full w-full justify-between">
                          <span className="text-black text-[12px]">
                            Descontos
                          </span>
                          <span className="flex items-center gap-1 text-green-600 font-normal text-[12px]">
                            R$ {formatCurrencyBRL(totalDiscount)}
                          </span>
                        </span>
                      </AccordionTrigger>
                      <AccordionContent className="flex max-w-full max-h-4 w-full justify-between p-0">
                        <span className="text-black pl-2 text-[10px]">
                          {totalQuantity ?? 0}compra
                        </span>
                        <span className="flex items-center gap-1 text-green-600 font-normal text-[10px]">
                          R$ {formatCurrencyBRL(totalDiscount / totalQuantity)}
                        </span>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <dt className="font-bold text-black text-[14px]">Total</dt>
                  <dd className="flex flex-col items-end gap-0.5">
                    <span className="font-bold text-black text-[14px]">
                      R$ {formatCurrencyBRL(totalWithFee)}
                    </span>
                    <span className="text-[10px] font-normal text-green-600">
                      {getInstallmentsOptions()}
                    </span>
                  </dd>
                </div>
              </dl>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </>
  );
};
