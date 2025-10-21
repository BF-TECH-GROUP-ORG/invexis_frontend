import userData from "@/db/users.json"
import sessionsData from "@/db/sessions.json"

let users = [...userData]
let sessions = [...sessionsData]

export const authService = {
  login: async ({ email, password }) => {
    const user = users.find((u) => u.email === email && u.password === password);
    if (!user) throw new Error("Invalid credentials");

    const token = "fake-jwt-" + user._id;
    const session = {
      id: "s" + (sessions.length + 1),
      user_id: user._id,
      start_time: new Date().toISOString(),
      ip: "127.0.0.1",
      device: "Chrome Browser",
      country: "Rwanda"
    };
    sessions.push(session);

    return { user, token, session };
  },

  logout: async (userId) => {
    sessions = sessions.filter((s) => s.user_id !== userId);
    return true;
  },

  getSessions: async (userId) => {
    return sessions.filter((s) => s.user_id === userId);
  },

  register: async ({ email, password, role, company_id }) => {
    const exists = users.find((u) => u.email === email);
    if (exists) throw new Error("User already exists");

    const newUser = {
      _id: "u" + (users.length + 1),
      email,
      password,
      role,
      company_id,
      created_at: new Date().toISOString(),
    };
    users.push(newUser);
    return newUser;
  },

  getUsersByCompany: async (company_id) => {
    return users.filter((u) => u.company_id === company_id);
  }
};