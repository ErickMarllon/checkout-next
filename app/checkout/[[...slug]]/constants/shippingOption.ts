export type ShippingOption = {
  id: string;
  label: string;
  deliveryTime: string;
  price: number;
  highlight?: string;
};

export const shippingOption: ShippingOption[] = [
  {
    id: "sedex",
    label: "Sedex",
    deliveryTime: "1 a 4 dias",
    price: 0,
  },
  {
    id: "jadlog",
    label: "Jadlog",
    deliveryTime: "1 a 3 dias",
    price: 1894,
  },
  {
    id: "sedex10",
    label: "SEDEX 10 (CHEGA AMANHÃ)",
    deliveryTime: "Entrega garantida",
    price: 3449,
    highlight: "⚡ FULL",
  },
];
