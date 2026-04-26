export function formatCurrencyBRL(valueInCents: number) {
  return (valueInCents / 100).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
