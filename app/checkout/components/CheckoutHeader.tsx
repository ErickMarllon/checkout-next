import { Lock } from "lucide-react";
import Image from "next/image";
import { getAssetUrl } from "@/utils/getAssetUrl";
import { getHost } from "@/utils/getHost";
import { use } from "react";

export const CheckoutHeader = () => {
  const host = use(getHost());

  const logo = getAssetUrl(host, "logo", "logo");

  return (
    <header className="w-full bg-background border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        <div className="flex items-center">
          <span className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            <div className="relative max-h-6 max-w-38">
              {logo ? (
                <Image
                  src={logo}
                  alt="Logo"
                  width={160}
                  height={50}
                  className="object-contain w-auto h-auto"
                />
              ) : (
                <span>logo</span>
              )}
            </div>
          </span>
        </div>
        <div className="flex items-center gap-2 text-foreground">
          <Lock className="h-5 w-5" strokeWidth={2.25} />
          <div className="leading-tight">
            <div className="text-sm font-bold">PAGAMENTO</div>
            <div className="text-xs text-muted-foreground">100% SEGURO</div>
          </div>
        </div>
      </div>
    </header>
  );
};
