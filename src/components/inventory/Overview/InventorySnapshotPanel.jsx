import { Package, Layers, DollarSign, ClipboardList } from "lucide-react";
import { useTranslations } from "next-intl";

export default function InventorySnapshotPanel({ snapshot = {}, kpis = {} }) {
  const t = useTranslations("inventoryOverview.snapshot");
  const format = (v) => (typeof v === "number" ? v.toLocaleString() : v ?? "—");

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">
              {t("totalUnits")}
            </p>
            <p className="text-2xl font-extrabold text-gray-900">
              {format(
                snapshot.totalUnits ??
                kpis?.totalInventoryUnits ??
                snapshot.totalUnits
              )}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {t("skus")}: {format(snapshot.totalSKUs ?? snapshot.totalSkus ?? "—")}
            </p>
          </div>
          <div className="p-2 rounded-full bg-orange-50 text-orange-600">
            <Package size={20} />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">
              {t("availableUnits")}
            </p>
            <p className="text-2xl font-extrabold text-gray-900">
              {format(snapshot.availableUnits)}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {t("outOfStock")}: {format(snapshot.outOfStockUnits)}
            </p>
          </div>
          <div className="p-2 rounded-full bg-emerald-50 text-emerald-600">
            <Layers size={20} />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">
              {t("inventoryValue")}
            </p>
            <p className="text-2xl font-extrabold text-gray-900">
              {snapshot.totalInventoryValue
                ? `${Number(snapshot.totalInventoryValue).toLocaleString()} RWF`
                : "—"}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {t("avgUnitCost")}:{" "}
              {snapshot.averageUnitCost
                ? `${Number(snapshot.averageUnitCost).toLocaleString()} RWF`
                : "—"}
            </p>
          </div>
          <div className="p-2 rounded-full bg-indigo-50 text-indigo-600">
            <DollarSign size={20} />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">
              {t("netMovement")}
            </p>
            <p className="text-2xl font-extrabold text-gray-900">
              {kpis?.netStockMovement ?? kpis?.netMovement ?? "—"}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {t("stockIn")}: {kpis?.stockInUnits ?? "—"} • {t("stockOut")}:{" "}
              {kpis?.stockOutUnits ?? "—"}
            </p>
          </div>
          <div className="p-2 rounded-full bg-rose-50 text-rose-600">
            <ClipboardList size={20} />
          </div>
        </div>
      </div>
    </div>
  );
}
