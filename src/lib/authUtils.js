import fs from "fs";
import path from "path";
import usersDb from "@/db/users.json";
import companiesDb from "@/db/companies.json";

export const getUserFromToken = (token) => {
  if (!token || !token.startsWith("fake-jwt-")) return null;
  const userId = token.replace("fake-jwt-", "");

  const user = usersDb.find((u) => u._id === userId);

  if (!user) return null;

  const company = companiesDb.find((c) => c.id === user.company_id);
  return { ...user, company };
};

export const updateUserInDB = (userId, updatedSettings) => {
  const usersFilePath = path.join(process.cwd(), "src", "db", "users.json");
  const users = JSON.parse(fs.readFileSync(usersFilePath, "utf-8"));

  const userIndex = users.findIndex((u) => u._id === userId);
  if (userIndex === -1) throw new Error("User not found");

  users[userIndex] = { ...users[userIndex], ...updatedSettings };

  fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));

  const company = companiesDb.find((c) => c.id === users[userIndex].company_id);
  return { ...users[userIndex], company };
};
