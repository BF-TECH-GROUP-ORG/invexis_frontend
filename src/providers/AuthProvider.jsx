"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateAccessToken, clearAuthSession } from "@/features/auth/authSlice";
import AuthService from "@/services/AuthService";

export default function AuthProvider({ children }) {
  const dispatch = useDispatch();
  const [isChecking, setIsChecking] = useState(true);
  const { isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    const initAuth = async () => {
      try {
        // Try to refresh the token on mount to restore the session
        // The cookie is sent automatically with withCredentials: true
        const data = await AuthService.refreshToken();
        if (data && data.accessToken) {
          dispatch(updateAccessToken(data.accessToken));
        }
      } catch (error) {
        // Silently fail if no refresh token exists (user not logged in)
        // Only log if it's not a 401 (which is expected when not logged in)
        if (error.response?.status !== 401) {
          console.log("Session restoration failed:", error.message);
        }
        dispatch(clearAuthSession());
      } finally {
        setIsChecking(false);
      }
    };

    if (!isAuthenticated) {
        initAuth();
    } else {
        setIsChecking(false);
    }
  }, [dispatch, isAuthenticated]);

  // Optionally show a loading spinner while checking auth
  // if (isChecking) return <div>Loading...</div>;

  return <>{children}</>;
}
