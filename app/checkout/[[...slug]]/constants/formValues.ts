import { CheckoutFormData } from "../schemas/checkout";

export const CHECKOUT_DEFAULT_VALUES: CheckoutFormData = {
  amount: 0,
  identification: {
    name: "",
    email: "",
    phone: "",
    type: "cpf",
  },

  shipping: {
    fee: 0,
    address: {
      zipCode: "",
      street: "",
      streetNumber: "",
      complement: "",
      neighborhood: "",
      city: "",
      state: "",
      country: "BR",
    },
  },

  payment: {
    document: "",
    paymentMethod: "pix",
  },

  items: [
    {
      id: "",
      title: "",
      unitPrice: 0,
      quantity: 0,
      tangible: true,
      image: "",
    },
  ],
};
