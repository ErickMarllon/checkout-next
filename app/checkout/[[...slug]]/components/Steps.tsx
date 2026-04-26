"use client";

import { Dispatch, SetStateAction } from "react";
import { SquarePen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useFormContext } from "react-hook-form";
import { CheckoutFormData } from "../schemas/checkout";

import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { shippingOption } from "../constants/shippingOption";
import { Separator } from "@/components/ui/separator";
import { formatBRPhone } from "@/utils/formatBRPhone";

interface Props {
  step: number;
  onBack: Dispatch<SetStateAction<number>>;
}

export const Steps = ({ step, onBack }: Props) => {
  const { watch } = useFormContext<CheckoutFormData>();

  const fee = shippingOption.find((fee) => fee.price === watch("shipping.fee"));

  const renderIdentification = () => {
    return (
      <Card className="px-2 pt-2 pb-4 gap-2 max-h-fit bg-white lg:bg-[#F8FDF7] rounded-lg ring-0 shadow-none border-none lg:ring-1 lg:ring-[#1B9562]">
        <CardHeader className="px-2 py-0 my-0">
          <div className="flex items-center justify-between gap-3">
            <div className="inline-flex gap-3">
              <h2 className="text-base font-extrabold uppercase text-foreground">
                Identificação
              </h2>
            </div>
            <CardAction onClick={() => onBack(1)} className="">
              <Button
                variant="ghost"
                className="text-muted-foreground text-sm cursor-pointer"
              >
                Editar <SquarePen />
              </Button>
            </CardAction>
          </div>
        </CardHeader>

        <CardContent className="flex flex-col gap-1 px-2">
          <p className="inline-flex font-bold text-xs gap-1">
            {watch("identification.name")}
          </p>
          <p className="inline-flex text-xs gap-1">
            {watch("identification.email")}
          </p>
          <p className="inline-flex font-medium text-xs gap-1">
            {formatBRPhone(watch("identification.phone"))}
          </p>
        </CardContent>
      </Card>
    );
  };
  const renderShipping = () => {
    return (
      <Card className="px-2 py-2 gap-2  pb-4 max-h-fit bg-white lg:bg-[#F8FDF7] rounded-lg ring-0 shadow-none border-none lg:ring-1 lg:ring-[#1B9562]">
        <CardHeader className="px-2">
          <div className="flex items-center justify-between gap-3">
            <div className="inline-flex gap-3">
              <h2 className="text-base font-extrabold uppercase text-foreground">
                ENVIAR PARA
              </h2>
            </div>
            <CardAction onClick={() => onBack(2)} className="">
              <Button
                variant="ghost"
                className="text-muted-foreground text-sm cursor-pointer"
              >
                Editar <SquarePen />
              </Button>
            </CardAction>
          </div>
        </CardHeader>

        <CardContent className="flex text-xs flex-col gap-1 px-2">
          <p className="inline-flex gap-1">
            {watch("shipping.address.street")},<span />
            {watch("shipping.address.streetNumber")}
          </p>
          <p className="inline-flex gap-1">
            {watch("shipping.address.neighborhood")},<span />
            <span>
              {watch("shipping.address.city")}
              <span>/</span>
              {watch("shipping.address.state")}
            </span>
            {watch("shipping.address.zipCode")}
          </p>

          {fee?.price && (
            <span className="flex text-sm flex-col mt-2">
              <b>Frete selecionado</b>
              <span className="flex text-xs items-center gap-1">
                <span className="capitalize">{fee?.id}</span>
                <span>-</span>
                <span>
                  {fee?.price > 0
                    ? `R$ ${(fee?.price / 100).toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}`
                    : "Grátis"}
                </span>
              </span>
            </span>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div
      className={cn(
        "border lg:space-y-4 lg:border-none rounded-lg ",
        step <= 1 && "hidden",
      )}
    >
      {step > 1 && renderIdentification()}
      <div className={cn(step > 2 ? "px-4 block lg:hidden " : "hidden")}>
        <Separator />
      </div>
      {step > 2 && renderShipping()}
    </div>
  );
};
