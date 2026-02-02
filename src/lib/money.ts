export function formatEUR(cents: number) {
  const value = (cents / 100).toFixed(2).replace(".", ",");
  return `${value} €`;
}