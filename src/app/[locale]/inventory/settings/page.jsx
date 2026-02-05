
import { Suspense } from "react";
import InventorySettingsContent from "@/components/inventory/InventorySettingsContent";

export const metadata = {
    title: "Inventory Settings",
    description: "Manage your inventory settings",
};

export default function InventorySettingsPage() {
    return (
        <Suspense fallback={
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-gray-500">Loading settings...</div>
            </div>
        }>
            <InventorySettingsContent />
        </Suspense>
    );
}
