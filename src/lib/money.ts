export function formatEUR(cents: number) {
  const value = cents / 100;

  // supprime les décimales inutiles (.00)
  return value.toLocaleString("fr-BE", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: value % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  });
}