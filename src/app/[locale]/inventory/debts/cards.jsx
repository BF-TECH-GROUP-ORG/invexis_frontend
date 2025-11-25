"use client";
import { Scale, ShieldCheck, CalendarClock, BadgeCheck } from "lucide-react";
import { useTranslations } from "next-intl";

const DebtCards = () => {
  const t = useTranslations("debtsPage");

  const cardsInfo = [
    {
      title: t("totalDebts"),
      icon: <Scale size={38} />,
      value: "$20",
      // description: t("totalDebts"), 
    },
    {
      title: t("clearedDebts"),
      icon: <ShieldCheck size={38} />,
      value: "$10",
      // description: t("clearedDebts"),
    },
    {
      title: t("upcomingPayments"),
      icon: <CalendarClock size={38} />,
      value: "$30",
      
    },
    {
      title: t("verifiedDebtors"),
      icon: <BadgeCheck size={38} />,
      value: "18",
     
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
