export type Product = {
  id: string;
  slug: string;
  name: string;
  basePriceCents: number;
  image: string;
  optionGroupIds: string[];
  tags?: string[];
};

export const PRODUCTS: Product[] = [
  // =====================
  // C R O U S T Y
  // =====================
  {
    id: "crousty",
    slug: "crousty",
    name: "Crousty",
    basePriceCents: 700,
    image: "/products/crousty.jpg",
    optionGroupIds: ["protein","base","size","sauce"],
  },

  // =====================
  // B O I S S O N S
  // =====================
  {
    id: "drink-coca",
    slug: "drink-coca",
    name: "Coca-Cola",
    basePriceCents: 200,
    image: "/products/drink-coca.jpg",
    optionGroupIds: [],
    tags: ["addon"],
  },
  {
    id: "drink-fanta",
    slug: "drink-fanta",
    name: "Fanta",
    basePriceCents: 200,
    image: "/products/drink-fanta.jpg",
    optionGroupIds: [],
    tags: ["addon"],
  },
  {
    id: "drink-water",
    slug: "drink-water",
    name: "Eau",
    basePriceCents: 150,
    image: "/products/drink-water.jpg",
    optionGroupIds: [],
    tags: ["addon"],
  },

  // =====================
  // D E S S E R T S
  // =====================
  {
    id: "dessert-tiramisu",
    slug: "dessert-tiramisu",
    name: "Tiramisu",
    basePriceCents: 350,
    image: "/products/dessert-tiramisu.jpg",
    optionGroupIds: [],
    tags: ["addon"],
  },
  {
    id: "dessert-cookie",
    slug: "dessert-cookie",
    name: "Cookie",
    basePriceCents: 250,
    image: "/products/dessert-cookie.jpg",
    optionGroupIds: [],
    tags: ["addon"],
  },
];