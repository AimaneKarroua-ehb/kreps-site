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
  size: {
    id: "size",
    title: "Taille",
    type: "single",
    required: true,
    options: [
      { id: "m", label: "M", priceDeltaCents: 0 },
      { id: "l", label: "L", priceDeltaCents: 100 },
      { id: "xl", label: "XL", priceDeltaCents: 200 },
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
    ],
  },
  extras: {
    id: "extras",
    title: "Extras",
    type: "multiple",
    required: false,
    maxSelect: 3,
    options: [
      { id: "cheese", label: "Fromage", priceDeltaCents: 50 },
      { id: "jalap", label: "Jalapeños", priceDeltaCents: 50 },
      { id: "double", label: "Double viande", priceDeltaCents: 200 },
    ],
  },
};