"use client";

import { CreditCardIcon } from "@/assets/svgs/creditCard";
import { TruckIcon } from "@/assets/svgs/truck";
import { UserIcon } from "@/assets/svgs/user";

const steps = [
  { id: 1, label: "Identificação", icon: UserIcon },
  { id: 2, label: "Entrega", icon: TruckIcon },
  { id: 3, label: "Pagamento", icon: CreditCardIcon },
];

export function CheckoutStepper({ current = 1 }: { current: number }) {
  return (
    <nav aria-label="Progress" className="w-full lg:hidden">
      <ol className="grid grid-cols-3">
        {steps.map((step, index) => {
          const stepIndex = index + 1;
          const Icon = step.icon;

          const isActive = stepIndex === current;
          const isCompleted = stepIndex < current;
          const isFuture = stepIndex > current;

          return (
            <li
              key={step.label}
              className={`relative flex flex-col items-center ${
                isFuture ? "opacity-60 pointer-events-none" : ""
              }`}
            >
              {/* Linha */}
              <div
                className={`
                  absolute h-0.75 top-4.5 z-0
                  ${index === 0 ? "left-1/2 right-0" : ""}
                  ${index === 1 ? "left-0 right-0" : ""}
                  ${index === 2 ? "left-0 right-1/2" : ""}
                  ${isCompleted || isActive ? "bg-[#157AE3]" : "bg-[#E5E7EB]"}
                `}
              />

              {/* Círculo */}
              <span
                className={`
                  size-10 flex items-center justify-center rounded-full
                  border-2 border-white z-10
                  text-[12px] font-semibold
                  ${
                    isCompleted || isActive
                      ? "bg-[#157AE3] text-white"
                      : "bg-[#E5E7EB] text-gray-400"
                  }
                `}
              >
                <Icon className="size-5" />
              </span>

              {/* Label */}
              <span
                className={`
                  text-[11px] max-w-22.5 text-center mt-1 font-semibold
                  ${isActive ? "text-black" : "text-gray-400"}
                `}
              >
                {step.label}
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
