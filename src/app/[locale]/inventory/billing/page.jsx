"use client";
import { useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { Loader2 } from "lucide-react";

function BillingPageContent() {
    const router = useRouter();
    const locale = useLocale();

    useEffect(() => {
        router.replace(`/${locale}/inventory/billing/payments`);
    }, [router, locale]);

    return (
        <div className="flex h-96 items-center justify-center">
            <Loader2 className="animate-spin text-orange-500" size={32} />
        </div>
    );
}


export default function BillingPage() {
    return (
        <Suspense fallback={<div className="flex justify-center items-center min-h-screen"><div className="text-gray-500">Loading...</div></div>}>
            <BillingPageContent />
        </Suspense>
    );
}

