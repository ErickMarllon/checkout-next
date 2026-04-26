"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import logo from "@/assets/images/58b97a32.webp";
import Image from "next/image";

export const CheckoutBanner = () => {
  return (
    <Dialog defaultOpen={true}>
      <DialogContent
        className="sm:max-w-md md:max-w-xl p-0 rounded-2xl overflow-hidden"
        showCloseButton={false}
      >
        <DialogHeader className="sr-only h-0">
          <DialogTitle>Checkout seguro</DialogTitle>
          <DialogDescription>
            Ambiente protegido para finalização de compra com segurança e
            criptografia de dados.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center gap-2">
          <div className="grid flex-1 gap-2">
            <Image
              src={logo}
              alt="Logo Mercado Pago"
              width={343}
              height={172}
              className="object-contain h-full w-full max-h-100"
              priority
              loading="eager"
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
