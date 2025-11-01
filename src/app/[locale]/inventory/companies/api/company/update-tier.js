import { readJson, writeJson } from "@/lib/jsonDb";

export default function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { id, newTier } = req.body;
  const companies = readJson("companies.json");

  const company = companies.find((c) => c.id === id);
  if (!company) return res.status(404).json({ error: "Company not found" });

  company.tier = newTier;
  writeJson("companies.json", companies);

  res.status(200).json(company);
}
