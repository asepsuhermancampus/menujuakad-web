import "server-only";
export const testingPackages = [
  { slug: "TEST_BASIC", name: "Uji dasar", amountIdr: 1000 },
  { slug: "TEST_STANDARD", name: "Uji lanjutan", amountIdr: 2000 },
  { slug: "TEST_PLUS", name: "Uji tambahan", amountIdr: 3000 },
] as const;
