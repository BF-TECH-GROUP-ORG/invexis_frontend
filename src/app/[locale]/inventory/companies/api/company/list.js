import { readJson } from "@/lib/jsonDb";

export default function handler(req, res) {
  if (req.method !== "GET") return res.status(405).end();

  const companies = readJson("companies.json");
  res.status(200).json(companies);
}
