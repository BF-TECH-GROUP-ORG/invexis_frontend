"use client";

export const dynamic = "force-dynamic";

import { useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { useSession } from "next-auth/react";
import { ShieldAlert } from "lucide-react";

function UnauthorizedPageContent() {
  const router = useRouter();
  const { data: session } = useSession();

  const locale = useLocale();

  useEffect(() => {
    // If user is not authenticated, redirect to localized login
    if (!session) {
      router.push(locale ? `/${locale}/auth/login` : `/en/auth/login`);
    }
  }, [session, router, locale]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
            <ShieldAlert className="w-10 h-10 text-red-600" />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-4">Access Denied</h1>

        <p className="text-gray-600 mb-8">
          You don't have permission to access this page. This area is restricted
          to administrators only.
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => router.back()}
            className="px-6 py-3 bg-[#081422] text-white rounded-lg hover:bg-[#0f2239] transition-colors font-semibold"
          >
            Go Back
          </button>

          <button
            onClick={() =>
              router.push(`/${locale ?? "en"}/inventory/dashboard`)
            }
            className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
          >
            Go to Dashboard
          </button>
        </div>

        {session?.user && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Logged in as:{" "}
              <span className="font-semibold">{session.user.email}</span>
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Role: <span className="capitalize">{session.user.role}</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}


export default function UnauthorizedPage() {
    return (
        <Suspense fallback={<div className="flex justify-center items-center h-screen">Loading...</div>}>
            <UnauthorizedPageContent />
        </Suspense>
    );
}

