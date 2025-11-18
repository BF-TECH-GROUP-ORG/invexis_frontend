"use client"

import { setAuthSession, clearAuthSession } from "@/features/auth/authSlice";
import { setSession, clearSession } from "@/features/session/sessionSlice";
import companiesDB from "@/db/companies.json";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export const loginUser = (email, password, locale) => async (dispatch) => {
  try {
    const res = await fetch(`/${locale}/auth/api/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) throw new Error("Login failed");

    let { user, token, session } = await res.json();

    const company = companiesDB.find((c) => c.id === user.company_id);
    user = { ...user, company };

    dispatch(setAuthSession({ user, token }));
    dispatch(setSession(session));
  } catch (err) {
    console.error("Login error:", err);
    throw err;
  }
};

export const logoutUser = () => (dispatch, locale) => {
  dispatch(clearAuthSession());
  dispatch(clearSession());
  const router = useRouter()
  useEffect(() => {
    router.push(`/${locale}/auth/login`)
  })
};

export const updateUserSettings = (settings, locale) => async (dispatch, getState) => {
  try {
    const { user, token } = getState().auth;
    const res = await fetch(`/${locale}/auth/api/update-settings`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(settings),
    });

    if (!res.ok) throw new Error("Failed to update settings");

    const updatedUser = await res.json();

    // Merge company info if needed
    const company = companiesDB.find((c) => c.id === updatedUser.company_id);
    const finalUser = { ...updatedUser, company };

    dispatch(setAuthSession({ user: finalUser, token }));
  } catch (err) {
    console.error("Update settings error:", err);
    throw err;
  }
};
