"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import loading from "@/assets/gif/loading-payment.gif";
import Image from "next/image";

interface Props {
  open?: boolean;
}
export const CheckoutLoading = ({ open }: Props) => {
  return (
    <Dialog open={open}>
      <DialogContent
        className="p-0 bg-transparent ring-0 border-none shadow-none flex items-center justify-center"
        showCloseButton={false}
      >
        <DialogHeader className="sr-only h-0 w-0 overflow-hidden">
          <DialogTitle>Finalizando sua compra</DialogTitle>
          <DialogDescription>
            Estamos validando seu pagamento em ambiente seguro. Isso pode levar
            alguns segundos.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col select-none  h-full w-full items-center justify-center">
          <Image
            src={loading}
            alt="Processando pagamento"
            priority
            loading="eager"
            height={160}
            width={160}
          />

          <b className="text-gray-700 text-lg">
            Estamos confirmando seu pagamento...
          </b>

          <span className="text-sm text-gray-500 text-center max-w-xs">
            Aguarde um momento...
          </span>
        </div>
      </DialogContent>
    </Dialog>
  );
};
