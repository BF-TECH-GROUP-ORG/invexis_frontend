import { readJson, writeJson } from "@/lib/jsonDb";
import { v4 as uuid } from "uuid";

export default function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { email, password, role, company_id } = req.body;
  const users = readJson("users.json");

  const exists = users.find((u) => u.email === email);
  if (exists) return res.status(400).json({ error: "User already exists" });

  const newUser = {
    _id: uuid(),
    email,
    password,
    role,
    company_id,
    created_at: new Date().toISOString(),
  };

  users.push(newUser);
  writeJson("users.json", users);

  res.status(201).json(newUser);
}
