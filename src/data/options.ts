
export type Option = {
  id: string;
  label: string;
  priceDeltaCents?: number; // + / -
};

export type OptionGroup = {
  id: string;
  title: string;
  type: "single" | "multiple";
  required?: boolean;
  maxSelect?: number; // si multiple
  options: Option[];
};

export const OPTION_GROUPS: Record<string, OptionGroup> = {
  protein: {
    id: "protein",
    title: "Choisis ton crousty",
    required: true,
    type: "single",
    options: [
      { id: "poulet", label: "Poulet", priceDeltaCents: 0 },
      { id: "crevettes", label: "Crevettes", priceDeltaCents: 0 },
      { id: "poisson", label: "Poisson", priceDeltaCents: 0 },  // mets un supplément si tu veux
    ],
  },
  base: {
    id: "base",
    title: "Base",
    type: "single",
    required: true,
    options: [
      { id: "base", label: "Originale", priceDeltaCents: 0 },
      { id: "curry", label: "Curry", priceDeltaCents: 0 },
    ],
  },
  size: {
    id: "size",
    title: "Taille",
    type: "single",
    required: true,
    options: [
      { id: "m", label: "M", priceDeltaCents: 0 },
      { id: "l", label: "L", priceDeltaCents: 200 },
      { id: "xl", label: "XL", priceDeltaCents: 500 },
    ],
  },
  sauce: {
    id: "sauce",
    title: "Sauce",
    type: "single",
    required: true,
    options: [
      { id: "spicy", label: "Piquante" },
      { id: "sweet", label: "Sucrée" },
      { id: "mix", label: "Piquante + Sucrée" },
      { id: "bbq", label: "Barbecue" },
    ],
  },
  drink: {
  id: "drink",
  title: "Boisson",
  required: false,
  type: "single",
  options: [
    { id: "none", label: "Aucune", priceDeltaCents: 0 },
    { id: "coca", label: "Coca-Cola", priceDeltaCents: 200 },
    { id: "coca_zero", label: "Coca Zero", priceDeltaCents: 200 },
    { id: "fanta", label: "Fanta", priceDeltaCents: 200 },
    { id: "sprite", label: "Sprite", priceDeltaCents: 200 },
    { id: "water", label: "Eau", priceDeltaCents: 150 },
  ],
},

dessert: {
  id: "dessert",
  title: "Dessert",
  required: false,
  type: "single",
  options: [
    { id: "none", label: "Aucun", priceDeltaCents: 0 },
    { id: "tiramisu", label: "Tiramisu", priceDeltaCents: 350 },
  ],
},
};