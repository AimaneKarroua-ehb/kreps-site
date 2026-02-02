export type Product = {
  id: string;
  slug: string;
  name: string;
  basePriceCents: number;
  image: string; // url ou /public
  optionGroupIds: string[];
  tags?: string[];
};

export const PRODUCTS: Product[] = [
  {
    id: "p1",
    slug: "crousty-poulet",
    name: "Crousty Poulet",
    basePriceCents: 790,
    image: "/food/poulet.png",
    optionGroupIds: ["size", "sauce", "extras"],
    tags: ["Bestseller"],
  },
  {
    id: "p2",
    slug: "crousty-crevettes",
    name: "Crousty Crevettes",
    basePriceCents: 890,
    image: "/food/crevettes.png",
    optionGroupIds: ["size", "sauce", "extras"],
  },
];