"use client";

import { useState, useEffect, use } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Smartphone } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import QRCode from "qrcode";
import Image from "next/image";

interface Props {
  params: Promise<{ slug?: string }>;
}
interface ShoppingCart {
  success: boolean;
  orderId: string;
  status: string;
  amount: string;
  pix: {
    qrcode: string;
    expirationDate: Date;
  };
}
export default function PixScreen(props: Props) {
  const params = use(props.params);
  const initialTime = 29 * 60; // 29 minutes
  const [time, setTime] = useState(initialTime);
  const [qrImage, setQrImage] = useState<string | null>(null);
  const [shoppingCart, setShoppingCart] = useState<ShoppingCart | null>(null);

  useEffect(() => {
    async function getItemsFromCart() {
      if (!params.slug) return null;
      const cartId = params.slug;
      const res = await fetch(`/api/pagloop/get-checkout?order_id=${cartId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch cart items");
      }

      setShoppingCart(await res.json());
    }
    getItemsFromCart();
  }, [params.slug]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTime((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  useEffect(() => {
    if (!shoppingCart?.pix.qrcode && !qrImage) return;
    async function generateQrCode() {
      try {
        const qrImage = await QRCode.toDataURL(shoppingCart?.pix.qrcode || "");
        setQrImage(qrImage);
      } catch (err) {
        console.error("Erro ao gerar QR Code:", err);
      }
    }
    generateQrCode();
  }, [shoppingCart?.pix.qrcode, qrImage]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shoppingCart?.pix.qrcode || "");
    alert("Código PIX copiado!");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <Card className="w-full max-w-md rounded-2xl shadow-lg">
        <CardContent className="p-6 space-y-6 text-center">
          <div>
            <h1 className="text-xl text-gray-700 font-semibold">
              Pix gerado com sucesso
            </h1>
            <p className="text-sm  mt-2">
              Estamos aguardando o pagamento! Após realizar o pagamento, aguarde
              nesta tela para confirmar seu pedido.
            </p>
            <Separator className="mt-4" />
          </div>
          <div>
            <div className="text-4xl font-bold">{formatTime(time)}</div>
            <p className="text-sm  mt-1">Tempo para conclusão da operação</p>
            <p className="text-sm mt-2">
              Pague através do código PIX <b>copie e cola</b>
            </p>
          </div>
          {qrImage && (
            <Image
              src={qrImage}
              alt="QR Code"
              width={200}
              height={200}
              priority
              loading="eager"
              className="mx-auto"
            />
          )}
          <div className="font-semibold">
            Valor no pix:
            <span className="text-green-600 ml-1">
              {(Number(shoppingCart?.amount) / 100).toLocaleString("pt-BR", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>
          <div className="bg-gray-100 rounded-lg p-3 max-h-10 items-center flex overflow-hidden text-xs break-all border">
            <p className="text-nowrap font-semibold text-base">
              {shoppingCart?.pix.qrcode}
            </p>
          </div>
          <Button
            type="button"
            onClick={handleCopy}
            className="w-full h-10 bg-green-600 hover:bg-green-700"
          >
            <Copy className="w-4 h-4 mr-2" />
            Copiar código pix
          </Button>
          <div className="bg-gray-50 border rounded-xl p-4 text-left text-sm space-y-2">
            <h2 className="font-medium text-center">Como pagar o seu pedido</h2>
            <div className="flex items-center">
              <Copy className="w-6 h-6 mr-2" />
              <p>
                <b className="mr-1">Copie o código</b> acima clicando no botão
              </p>
            </div>
            <div className="flex">
              <Smartphone className="w-10 h-10 mr-2" />
              <span>
                <p>
                  Abra o aplicativo do seu banco e selecione{" "}
                  <b className="mr-1">Copia e Cola</b>
                  na opção de <b>pagamento por PIX</b>.
                </p>
                <p className="mt-2">
                  Certifique-se que os dados estão corretos e finalize o
                  pagamento.
                </p>
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
