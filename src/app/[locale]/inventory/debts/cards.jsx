"use client";
import { Scale, ShieldCheck, CalendarClock, BadgeCheck } from "lucide-react";
import { useTranslations } from "next-intl";

const DebtCards = ({ debts = [] }) => {
  const t = useTranslations("debtsPage");

  // Calculate statistics from debts data
  const stats = {
    totalDebts: debts.length,
    totalAmount: debts.reduce((sum, debt) => sum + (debt.totalAmount || 0), 0),
    totalPaid: debts.reduce((sum, debt) => sum + (debt.amountPaidNow || 0), 0),
    totalRemaining: debts.reduce((sum, debt) => sum + (debt.balance || 0), 0),
    unpaidCount: debts.filter(debt => debt.status === "UNPAID").length,
    partiallyPaidCount: debts.filter(debt => debt.status === "PARTIALLY_PAID").length,
    paidCount: debts.filter(debt => debt.status === "PAID").length,
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-RW', {
      style: 'currency',
      currency: 'RWF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const cardsInfo = [
    {
      title: t("totalDebts"),
      icon: <Scale size={38} />,
      value: formatCurrency(stats.totalAmount),
    },
    {
      title: t("clearedDebts"),
      icon: <ShieldCheck size={38} />,
      value: stats.paidCount,
    },
    {
      title: t("upcomingPayments"),
      icon: <CalendarClock size={38} />,
      value: formatCurrency(stats.totalRemaining),
    },
    {
      title: t("verifiedDebtors"),
      icon: <BadgeCheck size={38} />,
      value: stats.totalDebts,
    },
  ];

  return (
    <section className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-4 gap-6">
      {cardsInfo.map((card, index) => (
        <div
          key={index}
          className="bg-white p-5 justify-between  flex rounded-xl border  space-y-3"
        >
          <div className="flex h-full items-center ">
            <div className="text-orange-500">{card.icon}</div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold">{card.value}</p>
            <h2 className="">{card.title}</h2>
          </div>

        </div>
      ))}
    </section>
  );
};

export default DebtCards;
