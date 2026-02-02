import { PRODUCTS } from "@/data/products";
import ProductCard from "@/components/ProductCard";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#2a0f5e] via-black to-black px-4 py-8">
      <div className="mx-auto max-w-md">
        <div className="text-white/70 text-sm">KR’eps</div>
        <h1 className="mt-2 text-4xl font-extrabold tracking-tight text-white">
          Ici c’est Bruxelles
        </h1>
        <p className="mt-2 text-white/70">
          Street food croustillante, sauces maison.
        </p>

        <div className="mt-6 grid gap-3">
          {PRODUCTS.map((p) => (
            <ProductCard key={p.id} p={p} />
          ))}
        </div>
      </div>
    </main>
  );
}