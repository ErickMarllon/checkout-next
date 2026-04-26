import { useMemo } from "react";

type Item = {
  unitPrice: number;
  quantity: number;
  discount?: number; // valor fixo (ex: 500 = R$5)
};

export function useCartTotals(items: Item[] = [], fee: number = 0) {
  const { totalPrice, totalQuantity, totalDiscount } = useMemo(() => {
    return items.reduce(
      (acc, item) => {
        const itemTotal = item.unitPrice * item.quantity;

        const discountValue = item.discount ? item.discount * item.quantity : 0;

        acc.totalPrice += itemTotal;
        acc.totalDiscount += discountValue;
        acc.totalQuantity += item.quantity;

        return acc;
      },
      { totalPrice: 0, totalQuantity: 0, totalDiscount: 0 },
    );
  }, [items]);

  const totalWithFee = totalPrice + fee - totalDiscount;

  return {
    totalPrice,
    totalQuantity,
    totalDiscount,
    totalWithFee,
  };
}
