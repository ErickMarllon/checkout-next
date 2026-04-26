export const PaymentBadge = ({
  label,
  className,
}: {
  label: string;
  className?: string;
}) => (
  <div
    className={`h-8 w-12 rounded border border-gray-500/30 bg-card flex items-center justify-center text-[9px] font-bold ${className ?? ""}`}
  >
    {label}
  </div>
);
