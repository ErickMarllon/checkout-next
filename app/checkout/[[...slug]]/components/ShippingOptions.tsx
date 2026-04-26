"use client";

import { useFormContext } from "react-hook-form";
import { shippingOption } from "../constants/shippingOption";

export function ShippingOptions() {
  const { watch, setValue } = useFormContext();

  const selected = watch("shipping.fee");

  const handleSelect = (price: number) => {
    setValue("shipping.fee", price, { shouldValidate: true });
  };

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium">Escolha o frete:</p>

      {shippingOption.map((option) => {
        const isSelected = selected === option.price;

        return (
          <button
            key={option.id}
            type="button"
            onClick={() => handleSelect(option.price)}
            className={`w-full rounded-2xl border py-4 px-2 flex items-center justify-between transition
              ${isSelected ? "border-blue-500 bg-blue-50" : "border-gray-200"}
            `}
          >
            <div className="flex items-center gap-2">
              {/* Radio */}
              <div
                className={`h-5 w-5 rounded-full border flex items-center justify-center
                  ${isSelected ? "border-blue-500" : "border-gray-300"}
                `}
              >
                {isSelected && (
                  <div className="h-2.5 w-2.5 rounded-full bg-blue-500" />
                )}
              </div>

              {/* Info */}
              <div className="text-left">
                <p className="text-xs font-semibold">{option.label}</p>
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  {option.deliveryTime}
                  {option.highlight && (
                    <span className="text-green-600 font-medium">
                      {option.highlight}
                    </span>
                  )}
                </p>
              </div>
            </div>

            <div className="text-sm font-semibold">
              {option.price === 0
                ? "Grátis"
                : `R$  ${(option.price / 100).toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}`}
            </div>
          </button>
        );
      })}
    </div>
  );
}
