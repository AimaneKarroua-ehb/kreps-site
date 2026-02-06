"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-[#130726] to-black">
      <div className="mx-auto max-w-6xl px-6 py-10">
        {/* Top bar (optionnel) */}
        <div className="flex items-center justify-between">
          <div className="text-white/80 text-sm tracking-wide">
            KR’EPS <span className="text-white/30">•</span> Bruxelles
          </div>

          <button
            onClick={() => router.push("/product/crousty")}
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 hover:bg-white/10"
          >
            Commander
          </button>
        </div>

        {/* Hero */}
        <section className="mt-10 grid items-center gap-10 lg:grid-cols-2">
          {/* Left: text */}
          <div className="order-2 lg:order-1">
            <h1 className="text-balance text-5xl font-extrabold tracking-tight text-white sm:text-6xl lg:text-7xl">
              ici c’est <span className="text-yellow-300">Bruxelles</span>
            </h1>

            <p className="mt-4 max-w-xl text-base leading-relaxed text-white/60 sm:text-lg">
              Crousty, sauces, vibes street-food. Commande en 30 secondes, on s’occupe du reste.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
              <button
                onClick={() => router.push("/product/crousty")}
                className="rounded-2xl bg-violet-500 px-6 py-4 font-semibold text-white shadow-lg shadow-violet-500/25 transition hover:bg-violet-400 active:scale-[0.99]"
              >
                Commander
              </button>

              <button
                onClick={() => router.push("/cart")}
                className="rounded-2xl border border-white/10 bg-white/5 px-6 py-4 font-semibold text-white/80 hover:bg-white/10 active:scale-[0.99]"
              >
                Voir le panier
              </button>
            </div>

            {/* Badges */}
            <div className="mt-8 flex flex-wrap gap-2">
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
                Dark kitchen
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
                Commande rapide
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
                Bruxelles
              </span>
            </div>
          </div>

          {/* Right: image */}
          <div className="order-1 lg:order-2">
            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-[0_0_0_1px_rgba(255,255,255,0.04)]">
              <div className="relative h-[340px] w-full sm:h-[420px]">
                <Image
                  src="/products/crousty.png"
                  alt="Crousty"
                  fill
                  priority
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 520px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              </div>

              <div className="p-5">
                <div className="text-white font-semibold">Le Crousty</div>
                <div className="text-white/60 text-sm">
                  Choisis ta protéine, ta taille, ta sauce. Simple. Efficace.
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer micro */}
        <div className="mt-14 text-center text-xs text-white/35">
          KR’EPS • Commande via réseaux sociaux • Bruxelles
        </div>
      </div>
    </main>
  );
}