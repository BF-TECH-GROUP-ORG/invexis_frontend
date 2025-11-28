// Mock inventory service — simulates async API calls for the overview page.
const MOCK_SUMMARY = { allProducts: 240, inStock: 200, lowInStock: 20 };

const MOCK_OVERVIEW_ITEMS = [
  { id: "p1", name: "iPhone 13", category: "Phones", unitPrice: 8800000, inStock: 90, totalValue: 792000000 },
  { id: "p2", name: "USB-C Charger", category: "Accessories", unitPrice: 15000, inStock: 240, totalValue: 3600000 },
  { id: "p3", name: "Office Chair", category: "Furniture", unitPrice: 120000, inStock: 12, totalValue: 1440000 },
  { id: "p4", name: "Wireless Mouse", category: "Accessories", unitPrice: 25000, inStock: 50, totalValue: 1250000 },
];

const MOCK_ITEMS = Array.from({ length: 12 }).map((_, i) => ({
  _id: String(i + 1),
  productName: `Product ${i + 1}`,
  category: i % 2 === 0 ? "Hardware" : "Accessories",
  unitPrice: 1000 + i * 50,
  inStock: 50 - i * 3,
  productCode: `CODE-${1000 + i}`,
  status: i % 3 === 0 ? "Active" : "Inactive",
  totalValue: (1000 + i * 50) * (50 - i * 3),
}));

function delay(ms) {
  return new Promise((res) => setTimeout(res, ms));
}

export async function getSummary() {
  // simulate network latency
  await delay(250);
  return MOCK_SUMMARY;
}

export async function getOverviewItems() {
  await delay(300);
  return MOCK_OVERVIEW_ITEMS;
}

export async function getItems() {
  await delay(350);
  return MOCK_ITEMS;
}

export default { getSummary, getOverviewItems, getItems };
