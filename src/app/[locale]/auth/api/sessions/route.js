import { readJson } from "@/lib/jsonDb";

export default function handler(req, res) {
  if (req.method !== "GET") return res.status(405).end();

  const { userId } = req.query;
  const sessions = readJson("sessions.json");

  const userSessions = sessions.filter((s) => s.user_id === userId);
  res.status(200).json(userSessions);
}
