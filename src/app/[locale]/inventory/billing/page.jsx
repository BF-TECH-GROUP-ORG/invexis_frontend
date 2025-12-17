"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { Loader2 } from "lucide-react";

export default function BillingPage() {
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
